"""
Dashboard Service - Coordinates dashboard statistics.
Uses direct Supabase client access for database operations.
"""

from __future__ import annotations

import logging
from typing import Dict, Any

from backend.core.logging import get_logger
from backend.database.supabase_client import get_supabase_client

logger = get_logger(__name__)


class DashboardService:
    """
    Service for dashboard statistics.
    Uses Supabase client directly for database operations.
    """

    def __init__(self):
        self._client = None

    def _get_client(self):
        if self._client is None:
            self._client = get_supabase_client()
        return self._client

    def get_dashboard_stats(self, user_id: str) -> Dict[str, Any]:
        """Get dashboard statistics for user."""
        try:
            client = self._get_client()
            
            # Get analysis counts
            analyses_result = client.schema("public").table("analysis_jobs")\
                .select("*", count="exact")\
                .eq("user_id", user_id)\
                .execute()
            
            # Get report counts
            reports_result = client.schema("public").table("reports")\
                .select("*", count="exact")\
                .eq("user_id", user_id)\
                .execute()
            
            # Get incident counts
            incidents_result = client.schema("public").table("incidents")\
                .select("*", count="exact")\
                .eq("user_id", user_id)\
                .execute()
            
            analyses = analyses_result.data or []
            reports = reports_result.data or []
            
            # Calculate statistics
            total_analyses = len(analyses)
            completed = sum(1 for a in analyses if a.get("status") == "completed")
            failed = sum(1 for a in analyses if a.get("status") == "failed")
            in_progress = sum(1 for a in analyses if a.get("status") in ("processing", "queued"))
            
            # Calculate average trust score from completed
            trust_scores = [a.get("overall_confidence", 0) or 0 for a in analyses if a.get("status") == "completed"]
            avg_trust_score = round(sum(trust_scores) / len(trust_scores), 1) if trust_scores else 0
            
            # Get recent analyses (last 5)
            recent = sorted(analyses, key=lambda x: x.get("created_at", ""), reverse=True)[:5]
            
            # Count by status
            status_counts = {}
            for a in analyses:
                status = a.get("status", "unknown")
                status_counts[status] = status_counts.get(status, 0) + 1
            
            # Count by module
            module_counts = {}
            for a in analyses:
                module = a.get("module_type", "unknown")
                module_counts[module] = module_counts.get(module, 0) + 1
            
            # Calculate average trust score from reports table (more accurate)
            report_trust_scores = [r.get("trust_score", 0) or 0 for r in reports if r.get("trust_score")]
            avg_report_trust = round(sum(report_trust_scores) / len(report_trust_scores), 1) if report_trust_scores else 0
            
            # Use report trust score if available, otherwise fall back to analysis_jobs
            final_avg_trust = avg_report_trust if report_trust_scores else avg_trust_score
            
            # Count high risk incidents
            high_risk_incidents = sum(1 for i in (incidents_result.data or []) if i.get("severity") in ("high", "critical"))
            
            return {
                "total_analyses": total_analyses,
                "total_scans": total_analyses,
                "completed_analyses": completed,
                "total_reports": len(reports),
                "completed_reports": len(reports),
                "failed_analyses": failed,
                "processing_analyses": in_progress,
                "total_incidents": len(incidents_result.data or []),
                "high_risk_incidents": high_risk_incidents,
                "average_trust_score": final_avg_trust,
                "status_distribution": status_counts,
                "module_distribution": module_counts,
                "recent_scans": [
                    {
                        "id": a.get("id"),
                        "filename": a.get("title") or (a.get("input_content") or "")[:50],
                        "title": a.get("title"),
                        "module": a.get("module_type"),
                        "status": a.get("status"),
                        "trust_score": round((a.get("overall_confidence", 0) or 0) * 100, 1),
                        "created_at": a.get("created_at"),
                    }
                    for a in recent
                ],
                "recent_analyses": [
                    {
                        "id": a.get("id"),
                        "title": a.get("title"),
                        "module": a.get("module_type"),
                        "status": a.get("status"),
                        "trust_score": round((a.get("overall_confidence", 0) or 0) * 100, 1),
                        "created_at": a.get("created_at"),
                    }
                    for a in recent
                ],
                "running_jobs": status_counts.get("processing", 0) + status_counts.get("queued", 0),
                "completed_jobs": completed,
            }
        except Exception as e:
            logger.error(f"[DashboardService] Failed to get dashboard stats: {e}")
            return {
                "total_analyses": 0,
                "completed_analyses": 0,
                "failed_analyses": 0,
                "in_progress_analyses": 0,
                "total_reports": 0,
                "total_incidents": 0,
                "high_risk_incidents": 0,
                "average_trust_score": 0,
                "status_distribution": {},
                "module_distribution": {},
                "recent_analyses": [],
            }


# Global service instance
dashboard_service = DashboardService()