"""
Document Verification API Routes
POST /api/document/upload         — upload and verify documents (PDF, Word,
                                     PowerPoint, Excel, RTF, text, OpenDocument)
GET  /api/document/analysis/{id}  — fetch status/result of a submitted analysis
GET  /api/document/history        — list a user's document analyses
GET  /api/document/report/{id}    — fetch the report for an analysis
DELETE /api/document/analysis/{id}
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status

from backend.api.dependencies import get_current_user
from backend.document.service import document_verification_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/document", tags=["document"])


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    """Upload a document and start the verification pipeline in the background."""
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")

        file_data = await file.read()
        if len(file_data) == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        if len(file_data) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 50MB)")

        result = await document_verification_service.verify_upload(
            file_data, file.filename, file.content_type or "application/octet-stream", user_id,
        )
        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analysis/{analysis_id}")
async def get_document_analysis(
    analysis_id: str,
    user_id: str = Depends(get_current_user),
):
    """Fetch the status/result of a document verification."""
    result = await document_verification_service.get_analysis(analysis_id, user_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return {"success": True, **result}


@router.get("/history")
async def get_document_history(
    limit: int = 20,
    offset: int = 0,
    status_filter: Optional[str] = None,
    user_id: str = Depends(get_current_user),
):
    """List a user's document analyses."""
    result = await document_verification_service.list_analyses(
        user_id, limit=limit, offset=offset, status=status_filter,
    )
    return {
        "success": True,
        "analyses": result.get("analyses", []),
        "count": result.get("count", 0),
    }


@router.get("/report/{analysis_id}")
async def get_document_report(
    analysis_id: str,
    user_id: str = Depends(get_current_user),
):
    """Fetch the report for a document analysis."""
    report = await document_verification_service.get_report(analysis_id, user_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return {"success": True, "report": report}


@router.get("/reports")
async def list_document_reports(
    limit: int = 20,
    offset: int = 0,
    user_id: str = Depends(get_current_user),
):
    """List a user's document reports."""
    result = await document_verification_service.list_reports(user_id, limit=limit, offset=offset)
    return {
        "success": True,
        "reports": result.get("reports", []),
        "count": result.get("count", 0),
    }


@router.get("/dashboard")
async def get_document_dashboard(
    user_id: str = Depends(get_current_user),
):
    """Get document analysis dashboard statistics."""
    stats = await document_verification_service.get_dashboard_stats(user_id)
    return {"success": True, "stats": stats}


@router.delete("/analysis/{analysis_id}")
async def delete_document_analysis(
    analysis_id: str,
    user_id: str = Depends(get_current_user),
):
    """Delete a document analysis."""
    success = await document_verification_service.delete_analysis(analysis_id, user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return {"success": True, "message": "Analysis deleted"}
