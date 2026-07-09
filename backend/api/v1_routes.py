"""
API V1 Routes
Versioned API endpoints for image analysis.
"""

from __future__ import annotations

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from pydantic import BaseModel, Field
from datetime import datetime

from backend.core.logging import get_logger
from backend.core.exceptions import ValidationError
from backend.services.analysis_service import AnalysisService, ImageAnalysisRequest
from backend.schemas.analysis import ModuleType

logger = get_logger(__name__)

router = APIRouter()


# ---- Request/Response Schemas ----

class ImageAnalysisResponse(BaseModel):
    """Response for image analysis request."""
    success: bool = True
    analysis_id: str
    module: str = "image"
    status: str = "processing"
    message: str = "Analysis started"
    created_at: str


class ImageUploadRequest(BaseModel):
    """Request to analyze an image by URL."""
    source_url: Optional[str] = Field(None, description="URL of image to analyze")
    title: Optional[str] = Field(None, description="Optional title")


class AnalysisStatusResponse(BaseModel):
    """Analysis status response."""
    analysis_id: str
    status: str
    module_type: str
    overall_verdict: Optional[str] = None
    overall_confidence: Optional[float] = None
    created_at: str
    completed_at: Optional[str] = None


# ---- Endpoints ----

@router.post("/analysis/image", response_model=ImageAnalysisResponse)
async def analyze_image(
    file: Optional[UploadFile] = File(None),
    source_url: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
):
    """
    Analyze an image file.
    
    Accepts multipart/form-data with:
    - file: UploadFile (optional if source_url provided)
    - source_url: URL to image (optional if file provided)
    - title: Optional title
    
    Returns:
        Analysis ID for tracking progress
    """
    try:
        # Validate input
        if not file and not source_url:
            raise ValidationError(message="Either file or source_url must be provided")
        
        # TODO: Upload file to storage and get artifact references
        # For now, use placeholder
        artifact_references = ["placeholder-artifact-id"]
        
        # Create request
        request = ImageAnalysisRequest(
            module_type=ModuleType.IMAGE,
            user_id="anonymous",  # TODO: Get from auth
            artifact_references=artifact_references,
            source_url=source_url,
            title=title,
        )
        
        # Start analysis
        analysis_id = await AnalysisService.start_image_analysis(request)
        
        return ImageAnalysisResponse(
            success=True,
            analysis_id=analysis_id,
            module="image",
            status="processing",
            message="Analysis started successfully",
            created_at=datetime.now().isoformat(),
        )
        
    except ValidationError:
        raise
    except Exception as e:
        logger.error(f"Failed to start image analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analysis/{analysis_id}/status", response_model=AnalysisStatusResponse)
async def get_analysis_status(analysis_id: str):
    """Get analysis status by ID."""
    try:
        status = await AnalysisService().get_analysis_status(analysis_id)
        if not status:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        return AnalysisStatusResponse(**status)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get analysis status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    """Get full analysis details."""
    try:
        analysis = await AnalysisService().get_analysis(analysis_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        return {"success": True, "analysis": analysis}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analyses")
async def list_analyses(
    user_id: str = "anonymous",
    module: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
):
    """List analyses for user."""
    try:
        analyses = await AnalysisService().list_analyses(
            user_id=user_id,
            limit=limit,
            offset=offset,
            module=module,
            status=status,
        )
        
        return {
            "success": True,
            "analyses": analyses,
            "count": len(analyses),
        }
    except Exception as e:
        logger.error(f"Failed to list analyses: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/analysis/{analysis_id}")
async def delete_analysis(analysis_id: str):
    """Delete analysis."""
    try:
        # TODO: Implement delete in AnalysisService
        return {"success": True, "message": "Analysis deleted"}
    except Exception as e:
        logger.error(f"Failed to delete analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))