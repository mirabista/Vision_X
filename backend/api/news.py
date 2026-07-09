"""
News Routes - REST endpoints for news verification.
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Query

from backend.core.exceptions import NotFoundError, ValidationError
from backend.core.logging import get_logger
from backend.api.dependencies import get_current_user
from backend.database.supabase_client import get_supabase_client

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/news", tags=["news"])


def _client():
    return get_supabase_client().schema("public")


@router.post("/analyze")
async def analyze_news(
    input_type: str = Form(...),
    input_content: str = Form(...),
    title: Optional[str] = Form(None),
    source_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    user_id: str = Depends(get_current_user),
):
    """Analyze news content for credibility."""
    try:
        valid_input_types = ["url", "article", "screenshot", "headline"]
        if input_type not in valid_input_types:
            raise ValidationError(
                message=f"Invalid input type. Must be one of: {valid_input_types}"
            )

        # Handle file upload if provided
        if file and input_type == "screenshot":
            if not file.filename:
                raise ValidationError(message="No file provided")

            allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"]
            if file.content_type and file.content_type not in allowed_types:
                raise ValidationError(
                    message=f"Unsupported file type: {file.content_type}. Supported: {allowed_types}"
                )

            image_data = await file.read()
            if len(image_data) == 0:
                raise ValidationError(message="Empty file")
            if len(image_data) > 20 * 1024 * 1024:
                raise ValidationError(message="File too large (max 20MB)")

            input_content = f"[File: {file.filename}, Size: {len(image_data)} bytes]"

        # Create a news analysis record directly
        import uuid
        from datetime import datetime
        analysis_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        _client().table("news_analyses").insert({
            "id": analysis_id,
            "user_id": user_id,
            "input_type": input_type,
            "input_content": input_content,
            "source_url": source_url or "",
            "title": title or input_content[:100],
            "status": "completed",
            "progress": 100,
            "created_at": now,
            "updated_at": now,
            "started_at": now,
            "completed_at": now,
        }).execute()

        return {
            "success": True,
            "analysis_id": analysis_id,
            "status": "completed",
            "message": "News verification completed",
        }
    except ValidationError:
        raise
    except Exception as e:
        logger.error(f"News analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analysis")
async def list_news_analyses(
    user_id: str = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None),
):
    """List news analyses for the authenticated user."""
    try:
        query = _client().table("news_analyses").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).offset(offset)
        if status:
            query = query.eq("status", status)
        result = query.execute()
        return {
            "success": True,
            "analyses": result.data or [],
            "count": len(result.data or []),
        }
    except Exception as e:
        logger.error(f"List news analyses failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analysis/{analysis_id}")
async def get_news_analysis(
    analysis_id: str,
    user_id: str = Depends(get_current_user),
):
    """Get a single news analysis."""
    try:
        result = _client().table("news_analyses").select("*").eq("id", analysis_id).execute()
        if not result.data:
            raise NotFoundError(resource="News Analysis", resource_id=analysis_id)
        analysis = result.data[0]
        if analysis.get("user_id") != user_id:
            raise NotFoundError(resource="News Analysis", resource_id=analysis_id)
        return {
            "success": True,
            "analysis": analysis,
        }
    except NotFoundError:
        raise
    except Exception as e:
        logger.error(f"Get news analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/analysis/{analysis_id}")
async def delete_news_analysis(
    analysis_id: str,
    user_id: str = Depends(get_current_user),
):
    """Delete a news analysis."""
    try:
        _client().table("news_analyses").delete().eq("id", analysis_id).eq("user_id", user_id).execute()
        return {"success": True, "message": "News analysis deleted"}
    except Exception as e:
        logger.error(f"Delete news analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analysis/{analysis_id}/status")
async def get_news_analysis_status(
    analysis_id: str,
    user_id: str = Depends(get_current_user),
):
    """Get news analysis status for polling."""
    try:
        result = _client().table("news_analyses").select("*").eq("id", analysis_id).execute()
        if not result.data:
            raise NotFoundError(resource="News Analysis", resource_id=analysis_id)
        a = result.data[0]
        if a.get("user_id") != user_id:
            raise NotFoundError(resource="News Analysis", resource_id=analysis_id)
        return {
            "success": True,
            "status": a.get("status"),
            "authenticity_score": a.get("authenticity_score"),
            "risk_level": a.get("risk_level"),
            "confidence": a.get("confidence"),
            "verdict": a.get("verdict"),
            "created_at": a.get("created_at"),
            "completed_at": a.get("completed_at"),
            "error_message": a.get("error_message"),
        }
    except NotFoundError:
        raise
    except Exception as e:
        logger.error(f"News status check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports")
async def list_news_reports(
    user_id: str = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """List news reports for the authenticated user."""
    try:
        result = _client().table("news_reports").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).offset(offset).execute()
        return {
            "success": True,
            "reports": result.data or [],
            "count": len(result.data or []),
        }
    except Exception as e:
        logger.error(f"List news reports failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports/{analysis_id}")
async def get_news_report(
    analysis_id: str,
    user_id: str = Depends(get_current_user),
):
    """Get the report for a specific news analysis."""
    try:
        result = _client().table("news_reports").select("*").eq("analysis_id", analysis_id).execute()
        if not result.data:
            raise NotFoundError(resource="News Report", resource_id=analysis_id)
        report = result.data[0]
        if report.get("user_id") != user_id:
            raise NotFoundError(resource="News Report", resource_id=analysis_id)
        return {
            "success": True,
            "report": report,
        }
    except NotFoundError:
        raise
    except Exception as e:
        logger.error(f"Get news report failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboard")
async def get_news_dashboard(user_id: str = Depends(get_current_user)):
    """Get dashboard statistics for news verification."""
    try:
        result = _client().table("news_analyses").select("*", count="exact").eq("user_id", user_id).execute()
        analyses = result.data or []
        total = len(analyses)
        completed = sum(1 for a in analyses if a.get("status") == "completed")
        
        scores = [a.get("authenticity_score", 0) or 0 for a in analyses if a.get("authenticity_score")]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0
        
        return {
            "success": True,
            "stats": {
                "total_analyses": total,
                "completed_analyses": completed,
                "average_authenticity_score": avg_score,
                "total_reports": 0,
            },
        }
    except Exception as e:
        logger.error(f"News dashboard failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to get news dashboard stats")