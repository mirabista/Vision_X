"""
Document Verification Service — high-level orchestrator for document upload,
storage, and the verification pipeline. Mirrors VideoService's shape.
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any, Dict, Optional

from backend.document.types import Analysis
from backend.document.pipeline import document_pipeline
from backend.document.services.office_converter import is_pdf, is_convertible, convert_to_pdf
from backend.repositories.document_repository import document_repository
from backend.repositories.storage_repository import StorageRepository

logger = logging.getLogger(__name__)

MAX_PDF_SIZE = 50 * 1024 * 1024  # 50 MB

_storage = StorageRepository()


class DocumentVerificationService:
    """Orchestrates document upload, storage, and the verification pipeline."""

    def __init__(self):
        # asyncio.create_task() does not keep a strong reference to the task
        # itself — if nothing else does, it can be garbage-collected mid-run.
        self._background_tasks: set = set()

    async def verify_upload(
        self,
        file_data: bytes,
        filename: str,
        content_type: str,
        user_id: str,
    ) -> Dict[str, Any]:
        """Convert (if needed), upload to storage, create the analysis record,
        and start the verification pipeline in the background."""
        pdf_native = is_pdf(filename, content_type or "")
        if not pdf_native:
            if not is_convertible(filename):
                raise ValueError(
                    "Unsupported file type. Supported: PDF, Word (.doc/.docx), "
                    "PowerPoint (.ppt/.pptx), Excel (.xls/.xlsx), RTF, TXT, "
                    "OpenDocument (.odt/.odp/.ods)."
                )
            file_data = convert_to_pdf(file_data, filename)

        unique_name = f"{uuid.uuid4()}.pdf"
        storage_path = f"{user_id}/documents/{unique_name}"
        await _storage.upload(file_data, "uploads", storage_path, "application/pdf")

        record = await document_repository.create_analysis(
            user_id=user_id,
            original_filename=filename,
            storage_path=storage_path,
            file_size=len(file_data),
            content_type="application/pdf",
        )
        analysis_id = record.get("id")
        if not analysis_id:
            raise RuntimeError("Failed to create document analysis record")

        analysis = Analysis(
            id=analysis_id,
            user_id=user_id,
            original_filename=filename,
            storage_path=storage_path,
        )
        task = asyncio.create_task(document_pipeline.run(analysis))
        self._background_tasks.add(task)
        task.add_done_callback(self._background_tasks.discard)

        return {
            "success": True,
            "analysis_id": analysis_id,
            "status": "queued",
            "message": "Document verification started",
        }

    async def get_analysis(self, analysis_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        analysis = await document_repository.get_analysis(analysis_id, user_id)
        if not analysis:
            return None
        evidence = await document_repository.get_evidence(analysis_id)
        report = await document_repository.get_report(analysis_id, user_id)
        return {
            "analysis": analysis,
            "evidence": evidence,
            "agent_results": [],
            "report": report,
        }

    async def list_analyses(self, user_id: str, limit: int = 20, offset: int = 0,
                             status: Optional[str] = None) -> Dict[str, Any]:
        return await document_repository.list_analyses(user_id, limit=limit, offset=offset, status=status)

    async def get_report(self, analysis_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        return await document_repository.get_report(analysis_id, user_id)

    async def list_reports(self, user_id: str, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        return await document_repository.list_reports(user_id, limit=limit, offset=offset)

    async def delete_analysis(self, analysis_id: str, user_id: str) -> bool:
        return await document_repository.delete_analysis(analysis_id, user_id)

    async def get_dashboard_stats(self, user_id: str) -> Dict[str, Any]:
        return await document_repository.get_dashboard_stats(user_id)


document_verification_service = DocumentVerificationService()
