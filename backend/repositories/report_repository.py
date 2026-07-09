"""
Report Repository - Data access for reports.
Migrated from working ai_v2 implementation.
"""

from __future__ import annotations

import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime

from supabase import Client

from backend.ai_v2.models import Report

logger = logging.getLogger(__name__)


class ReportRepository:
    """Repository for reports."""

    def __init__(self, client: Client):
        self._client = client

    def _table(self, name: str):
        """Get table reference with visionx schema."""
        return self._client.schema("visionx").table(name)

    def create_report(self, report: Report) -> Optional[Report]:
        """Create report."""
        try:
            data = {
                "id": report.id,
                "analysis_id": report.analysis_id,
                "user_id": report.user_id,
                "upload_id": report.analysis_id,
                "report_id": report.id,
                "title": f"Analysis Report - {report.analysis_id[:8]}",
                "trust_score": report.report_data.get("trust_score", 0),
                "authenticity_status": "pending" if report.report_data.get("trust_score", 0) < 50 else "verified",
                "risk_level": report.report_data.get("risk_level", "medium"),
                "report_data": json.dumps(report.report_data, default=str),
                "pdf_url": report.pdf_url or "",
                "download_count": 0,
                "created_at": report.generated_at,
            }
            self._table("reports").insert(data).execute()
            return report
        except Exception as e:
            logger.exception(f"Failed to create report: {e}")
            raise

    def get_report(self, report_id: str, user_id: str) -> Optional[Report]:
        """Get report by ID."""
        try:
            result = self._table("reports")\
                .select("*")\
                .eq("id", report_id)\
                .eq("user_id", user_id)\
                .execute()
            if result.data:
                row = result.data[0]
                if isinstance(row.get("report_data"), str):
                    row["report_data"] = json.loads(row["report_data"])
                return Report(**row)
            return None
        except Exception as e:
            logger.exception(f"Failed to get report: {e}")
            return None

    def get_report_by_analysis_id(self, analysis_id: str, user_id: str) -> Optional[Report]:
        """Get report by analysis ID."""
        try:
            result = self._table("reports")\
                .select("*")\
                .eq("analysis_id", analysis_id)\
                .eq("user_id", user_id)\
                .execute()
            if result.data:
                return Report(**result.data[0])
            return None
        except Exception as e:
            logger.exception(f"Failed to get report by analysis_id: {e}")
            return None

    def list_reports(self, user_id: str, limit: int = 20, offset: int = 0) -> List[Report]:
        """List reports."""
        try:
            result = self._table("reports")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .offset(offset)\
                .execute()
            if result.data:
                return [Report.from_db(r) for r in result.data]
            return []
        except Exception as e:
            logger.exception(f"Failed to list reports: {e}")
            return []

    def delete_report(self, report_id: str, user_id: str) -> bool:
        """Delete report."""
        try:
            self._table("reports").delete().eq("id", report_id).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            logger.exception(f"Failed to delete report: {e}")
            return False


# Singleton will be initialized with client
report_repository = None


def init_report_repository(client: Client) -> ReportRepository:
    """Initialize report repository with Supabase client."""
    global report_repository
    report_repository = ReportRepository(client)
    return report_repository