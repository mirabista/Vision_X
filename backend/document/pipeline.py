"""
Document Verification Pipeline — orchestrates PDF analysis agents.
Structural → Metadata → Rasterize → Page Forensics → OCR → Reasoning → Decision → Report
"""

from __future__ import annotations

import asyncio
import logging
import tempfile
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

from backend.document.types import Analysis
from backend.repositories.document_repository import document_repository
from backend.repositories.storage_repository import StorageRepository

from backend.document.agents.pdf_structural_agent import PDFStructuralAgent
from backend.document.agents.pdf_metadata_agent import PDFMetadataAgent
from backend.document.agents.page_forensics_agent import PageForensicsAgent
from backend.document.agents.page_ocr_agent import PageOCRAgent
from backend.document.agents.document_reasoning_agent import DocumentReasoningAgent
from backend.document.agents.document_manager_agent import DocumentManagerAgent
from backend.document.agents.document_report_agent import DocumentReportAgent
from backend.document.services.pdf_rasterizer import PDFRasterizer

logger = logging.getLogger(__name__)

_storage = StorageRepository()


class DocumentPipeline:
    """Orchestrates the full PDF/document verification pipeline."""

    def __init__(self):
        self.structural = PDFStructuralAgent()
        self.metadata = PDFMetadataAgent()
        self.forensics = PageForensicsAgent()
        self.ocr = PageOCRAgent()
        self.reasoning = DocumentReasoningAgent()
        self.manager = DocumentManagerAgent()
        self.report = DocumentReportAgent()
        self.rasterizer = PDFRasterizer()

    async def run(self, analysis: Analysis) -> None:
        pdf_path: Optional[str] = None
        page_paths: list[str] = []
        try:
            logger.info(f"[DOC PIPELINE] Starting document analysis {analysis.id}")
            await document_repository.update_status(analysis.id, "processing", progress=5)

            pdf_path = await self._download_pdf(analysis)
            if not pdf_path:
                raise RuntimeError("Could not download PDF from storage")

            # Step 1: Structural analysis (CPU-bound — offload to a thread so it
            # doesn't block the event loop that serves every other request).
            logger.info(f"[DOC PIPELINE] Structural analysis on {analysis.id}")
            structural = await asyncio.to_thread(self.structural.analyze, pdf_path)
            await document_repository.update_status(analysis.id, "processing", progress=15)
            await self._save_evidence(analysis.id, "pdf_structural", "structural", structural)

            # Step 2: PDF metadata
            logger.info(f"[DOC PIPELINE] Metadata analysis on {analysis.id}")
            metadata = await asyncio.to_thread(self.metadata.analyze, pdf_path)
            await document_repository.update_status(analysis.id, "processing", progress=25)
            await self._save_evidence(analysis.id, "document_metadata", "metadata", metadata)

            # Step 3: Rasterize pages
            logger.info(f"[DOC PIPELINE] Rasterizing PDF pages for {analysis.id}")
            page_paths = await asyncio.to_thread(self.rasterizer.rasterize, pdf_path)
            if not page_paths:
                logger.warning(f"[DOC PIPELINE] No pages rasterized for {analysis.id}")
            await document_repository.update_status(analysis.id, "processing", progress=35)

            # Step 4: Page forensics (OpenCV — CPU-bound)
            logger.info(f"[DOC PIPELINE] Page forensics on {analysis.id}")
            image_result = await asyncio.to_thread(self.forensics.analyze_all, page_paths)
            await document_repository.update_status(analysis.id, "processing", progress=50)
            await self._save_evidence(analysis.id, "page_image_analysis", "page_forensics", image_result.evidence)

            # Step 5: OCR (EasyOCR — CPU-bound and can download models on first run)
            logger.info(f"[DOC PIPELINE] OCR on {analysis.id}")
            ocr_result = await asyncio.to_thread(self.ocr.extract_all, page_paths)
            await document_repository.update_status(analysis.id, "processing", progress=65)
            await self._save_evidence(analysis.id, "page_ocr", "ocr", ocr_result.evidence)

            # Step 6: Document reasoning (Gemini — blocking network call)
            logger.info(f"[DOC PIPELINE] Document reasoning on {analysis.id}")
            reasoning_result = await asyncio.to_thread(
                self.reasoning.run, analysis, structural, metadata, image_result, ocr_result,
            )
            await document_repository.update_status(analysis.id, "processing", progress=80)
            await self._save_evidence(analysis.id, "document_reasoning", "reasoning", reasoning_result.evidence)

            # Step 7: Manager decision
            logger.info(f"[DOC PIPELINE] Manager decision on {analysis.id}")
            manager_result = await self.manager.run(
                analysis, structural, metadata,
                image_result, ocr_result, reasoning_result,
            )
            await document_repository.update_status(analysis.id, "processing", progress=90)
            await self._save_evidence(analysis.id, "manager_decision", "manager_decision", manager_result.evidence)

            trust_score = manager_result.evidence.get("trust_score", 0)
            logger.info(f"[DOC PIPELINE] Trust score: {trust_score}%")

            # Step 8: Report (also finalizes analysis status/trust_score/verdict)
            logger.info(f"[DOC PIPELINE] Report generation on {analysis.id}")
            await self.report.run(
                analysis, manager_result, structural, metadata,
                image_result, ocr_result, reasoning_result,
            )

            logger.info(f"[DOC PIPELINE] Document analysis {analysis.id} completed")

        except Exception as e:
            logger.error(f"[DOC PIPELINE] Analysis {analysis.id} failed: {e}")
            await document_repository.update_analysis(
                analysis.id,
                status="failed",
                error_message=str(e),
                completed_at=datetime.now(timezone.utc).isoformat(),
            )

        finally:
            if page_paths:
                self.rasterizer.cleanup(page_paths)
            if pdf_path:
                Path(pdf_path).unlink(missing_ok=True)

    async def _download_pdf(self, analysis: Analysis) -> Optional[str]:
        try:
            file_data = await _storage.download("uploads", analysis.storage_path)
        except Exception as e:
            logger.error(f"[DOC PIPELINE] Failed to download {analysis.storage_path}: {e}")
            return None
        if not file_data:
            return None
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as f:
            f.write(file_data)
            return f.name

    async def _save_evidence(self, analysis_id: str, agent_name: str, evidence_type: str, evidence: dict) -> None:
        try:
            await document_repository.save_evidence(analysis_id, {
                "agent_name": agent_name,
                "evidence_type": evidence_type,
                "key": evidence_type,
                "value": "",
                "confidence": evidence.get("risk_score") if isinstance(evidence, dict) else None,
                "metadata": evidence,
            })
        except Exception as e:
            logger.error(f"Failed to save evidence {evidence_type}: {e}")


document_pipeline = DocumentPipeline()
