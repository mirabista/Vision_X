"""
Dashboard Routes - REST endpoints for dashboard statistics.
"""

from __future__ import annotations

import logging
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException

from backend.core.logging import get_logger
from backend.api.dependencies import get_current_user
from backend.services.dashboard_service import dashboard_service

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("/")
async def get_dashboard(user_id: str = Depends(get_current_user)):
    """Get dashboard statistics for current user."""
    try:
        stats = dashboard_service.get_dashboard_stats(user_id)
        return {
            "success": True,
            "stats": stats,
        }
    except Exception as e:
        logger.error(f"Failed to get dashboard stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get dashboard stats")
