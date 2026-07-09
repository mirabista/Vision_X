"""
Analysis Repository - Production-ready data access for analyses.
Migrated from ai_v2/repository.py with all database operations.
"""

from __future__ import annotations

import os
import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid as uuid_lib

from supabase import create_client, Client

from backend.ai_v2.models import (
    Analysis, AnalysisEvidence, Report, Incident, AgentResult,
    AnalysisStatus, EvidenceType, RiskLevel
)

logger = logging.getLogger(__name__)


def serialize(obj: Any) -> Any:
    """Convert non-serializable types to standard Python types."""
    import numpy as np
    if isinstance(obj, (np.bool_,)):
        return bool(obj)
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, uuid_lib.UUID):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, bytes):
        return obj.decode('utf-8', errors='replace')
    if isinstance(obj, dict):
        return {k: serialize(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [serialize(item) for item in obj]
    return obj


class AnalysisRepository:
    """
    Repository for analyses, evidence, reports, and incidents.
    Single source of truth for all database operations.
    """

    def __init__(self):
        self._client: Optional[Client] = None

    def initialize(self) -> None:
        """Initialize Supabase client."""
        if self._client:
            return
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = (
            os.getenv("SUPABASE_SERVICE_KEY") or
            os.getenv("SUPABASE_SERVICE_ROLE_KEY") or
            os.getenv("SUPABASE_KEY")
        )
        if not supabase_url or not supabase_key:
            raise RuntimeError(
                "Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY "
                "environment variables."
            )
        self._client = create_client(supabase_url, supabase_key)
        logger.info("AnalysisRepository initialized")

    @property
    def client(self) -> Client:
        """Get Supabase client, initializing if needed."""
        if self._client is None:
            self.initialize()
        if self._client is None:
            raise RuntimeError("Supabase client not initialized")
        return self._client

    def _table(self, name: str):
        """Get table reference with visionx schema."""
        return self.client.schema("visionx").table(name)

    # ============================================================================
    # Analyses
    # ============================================================================

    def create_analysis(self, analysis: Analysis) -> Optional[Analysis]:
        """Create analysis record."""
        try:
            data = serialize(analysis.dict(exclude={"id", "image_url", "thumbnail_url"}))
            data["id"] = analysis.id
            result = self._table("analyses").insert(data).execute()
            if result.data:
                return Analysis.from_db(result.data[0])
            return analysis
        except Exception as e:
            logger.exception(f"Failed to create analysis: {e}")
            raise

    def get_analysis(self, analysis_id: str, user_id: str) -> Optional[Analysis]:
        """Get analysis by ID."""
        try:
            result = self._table("analyses")\
                .select("*")\
                .eq("id", analysis_id)\
                .eq("user_id", user_id)\
                .execute()
            if result.data:
                return Analysis.from_db(result.data[0])
            return None
        except Exception as e:
            logger.exception(f"Failed to get analysis {analysis_id}: {e}")
            return None

    def get_news_analysis(self, analysis_id: str, user_id: str) -> Optional[Any]:
        """Fallback lookup for news analyses."""
        try:
            from backend.news.models import NewsAnalysis
            from backend.news.repository import news_db
            return news_db.get_analysis(analysis_id, user_id)
        except Exception:
            return None

    def update_analysis(self, analysis_id: str, updates: Dict[str, Any]) -> bool:
        """Update analysis."""
        try:
            sanitized = dict(updates)
            for ts_field in ("completed_at", "created_at", "updated_at"):
                val = sanitized.get(ts_field)
                if isinstance(val, str) and "," in val:
                    sanitized[ts_field] = val.replace(",", ".")
            self._table("analyses").update(serialize(sanitized)).eq("id", analysis_id).execute()
            return True
        except Exception as e:
            logger.exception(f"Failed to update analysis {analysis_id}: {e}")
            return False

    def list_analyses(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        module: Optional[str] = None,
        status: Optional[str] = None,
        **filters
    ) -> List[Analysis]:
        """List analyses for user."""
        try:
            query = self._table("analyses")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .offset(offset)

            if module:
                query = query.eq("module", module)
            if status:
                query = query.eq("status", status)

            result = query.execute()
            if result.data:
                return [Analysis.from_db(r) for r in result.data]
            return []
        except Exception as e:
            logger.exception(f"Failed to list analyses: {e}")
            return []

    def delete_analysis(self, analysis_id: str, user_id: str) -> bool:
        """Delete analysis."""
        try:
            self._table("analyses").delete().eq("id", analysis_id).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            logger.exception(f"Failed to delete analysis {analysis_id}: {e}")
            return False

    def count_analyses(self, user_id: str, status: Optional[str] = None) -> int:
        """Count analyses."""
        try:
            query = self._table("analyses")\
                .select("id", count="exact")\
                .eq("user_id", user_id)
            if status:
                query = query.eq("status", status)
            result = query.execute()
            return result.count if hasattr(result, 'count') else 0
        except Exception as e:
            logger.exception(f"Failed to count analyses: {e}")
            return 0

    def get_latest_analyses(self, user_id: str, limit: int = 10) -> List[Analysis]:
        """Get latest analyses for user."""
        return self.list_analyses(user_id=user_id, limit=limit, offset=0)

    # ============================================================================
    # Evidence
    # ============================================================================

    def save_evidence(self, evidence: AnalysisEvidence) -> bool:
        """Save evidence."""
        try:
            data = {
                "id": evidence.id,
                "analysis_id": evidence.analysis_id,
                "evidence_type": evidence.evidence_type,
                "evidence_data": json.dumps(serialize(evidence.evidence_data), default=str),
                "confidence": evidence.confidence,
                "created_at": evidence.created_at,
            }
            self._table("analysis_evidence").insert(data).execute()
            return True
        except Exception as e:
            logger.exception(f"Failed to save evidence: {e}")
            return False

    def get_evidence(
        self,
        analysis_id: str,
        evidence_type: str,
        user_id: str
    ) -> Optional[AnalysisEvidence]:
        """Get evidence by type."""
        try:
            result = self._table("analysis_evidence")\
                .select("*")\
                .eq("analysis_id", analysis_id)\
                .eq("evidence_type", evidence_type)\
                .execute()
            if result.data:
                return AnalysisEvidence.from_db(result.data[0])
            return None
        except Exception as e:
            logger.exception(f"Failed to get evidence: {e}")
            return None

    def get_all_evidence(self, analysis_id: str, user_id: str) -> Dict[str, AnalysisEvidence]:
        """Get all evidence for analysis."""
        try:
            result = self._table("analysis_evidence")\
                .select("*")\
                .eq("analysis_id", analysis_id)\
                .execute()
            evidence_map = {}
            if result.data:
                for r in result.data:
                    ev = AnalysisEvidence.from_db(r)
                    evidence_map[ev.evidence_type] = ev
            return evidence_map
        except Exception as e:
            logger.exception(f"Failed to get all evidence: {e}")
            return {}

    # ============================================================================
    # Reports
    # ============================================================================

    def save_report(self, report: Report) -> bool:
        """Save report."""
        try:
            trust_score = report.report_data.get("trust_score", 0)
            risk_level = report.report_data.get("risk_level", "medium")
            data = {
                "id": report.id,
                "analysis_id": report.analysis_id,
                "user_id": report.user_id,
                "upload_id": report.analysis_id,
                "report_id": report.id,
                "title": f"Analysis Report - {report.analysis_id[:8]}",
                "trust_score": trust_score,
                "authenticity_status": "pending" if trust_score < 50 else "verified",
                "risk_level": risk_level,
                "report_data": json.dumps(serialize(report.report_data), default=str),
                "pdf_url": report.pdf_url or "",
                "download_count": 0,
                "created_at": report.generated_at,
            }
            self._table("reports").insert(data).execute()
            return True
        except Exception as e:
            logger.exception(f"Failed to save report: {e}")
            return False

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

    # ============================================================================
    # Incidents
    # ============================================================================

    def create_incident(self, incident: Incident) -> bool:
        """Create incident."""
        try:
            data = serialize({
                "id": incident.id,
                "analysis_id": incident.analysis_id,
                "user_id": incident.user_id,
                "reason": incident.reason,
                "title": f"Security Incident - {incident.analysis_id[:8]}",
                "description": incident.reason,
                "status": incident.status,
                "severity": incident.risk_level,
                "trust_score": incident.trust_score,
                "risk_level": incident.risk_level,
                "tags": ["auto-generated", incident.risk_level],
                "metadata": {
                    "analysis_id": incident.analysis_id,
                    "trust_score": incident.trust_score
                },
                "created_at": incident.created_at,
            })
            self._table("incidents").insert(data).execute()
            return True
        except Exception as e:
            logger.exception(f"Failed to create incident: {e}")
            return False

    def list_incidents(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0
    ) -> List[Incident]:
        """List incidents."""
        try:
            result = self._table("incidents")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .offset(offset)\
                .execute()
            if result.data:
                return [Incident.from_db(r) for r in result.data]
            return []
        except Exception as e:
            logger.exception(f"Failed to list incidents: {e}")
            return []

    # ============================================================================
    # Statistics
    # ============================================================================

    def get_dashboard_stats(self, user_id: str) -> Dict[str, Any]:
        """Get dashboard statistics."""
        try:
            analyses = self._table("analyses")\
                .select("*")\
                .eq("user_id", user_id)\
                .execute()

            if not analyses.data:
                return self._empty_stats()

            total = len(analyses.data)
            completed = sum(1 for a in analyses.data if a.get("status") == "completed")
            processing = sum(1 for a in analyses.data if a.get("status") == "processing")
            failed = sum(1 for a in analyses.data if a.get("status") == "failed")

            trust_scores = [
                a.get("trust_score", 0) or 0
                for a in analyses.data
                if a.get("status") == "completed" and a.get("trust_score") is not None
            ]
            avg_trust = round(sum(trust_scores) / len(trust_scores), 1) if trust_scores else 0

            risk_dist = {"minimal": 0, "low": 0, "medium": 0, "high": 0, "critical": 0}
            for a in analyses.data:
                rl = a.get("risk_level", "")
                if rl in risk_dist:
                    risk_dist[rl] += 1

            reports_count = 0
            reports_result = self._table("reports")\
                .select("id", count="exact")\
                .eq("user_id", user_id)\
                .execute()
            if hasattr(reports_result, 'count'):
                reports_count = reports_result.count

            incidents_count = 0
            incidents_result = self._table("incidents")\
                .select("id", count="exact")\
                .eq("user_id", user_id)\
                .execute()
            if hasattr(incidents_result, 'count'):
                incidents_count = incidents_result.count

            recent = sorted(
                analyses.data,
                key=lambda a: a.get("created_at", ""),
                reverse=True
            )[:5]

            return {
                "total_analyses": total,
                "completed_analyses": completed,
                "processing_analyses": processing,
                "failed_analyses": failed,
                "average_trust_score": avg_trust,
                "risk_distribution": risk_dist,
                "total_reports": reports_count,
                "total_incidents": incidents_count,
                "recent_analyses": [
                    {
                        "id": a.get("id"),
                        "filename": a.get("original_filename", a.get("filename", "")),
                        "status": a.get("status"),
                        "trust_score": a.get("trust_score"),
                        "risk_level": a.get("risk_level"),
                        "created_at": a.get("created_at"),
                    }
                    for a in recent
                ],
            }
        except Exception as e:
            logger.exception(f"Failed to get dashboard stats: {e}")
            return self._empty_stats()

    def _empty_stats(self) -> Dict[str, Any]:
        """Return empty stats template."""
        return {
            "total_analyses": 0,
            "completed_analyses": 0,
            "processing_analyses": 0,
            "failed_analyses": 0,
            "average_trust_score": 0,
            "risk_distribution": {
                "minimal": 0, "low": 0, "medium": 0, "high": 0, "critical": 0
            },
            "total_reports": 0,
            "total_incidents": 0,
            "recent_analyses": [],
        }


# Singleton instance
analysis_repository = AnalysisRepository()