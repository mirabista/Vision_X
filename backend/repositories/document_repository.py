"""
Document Analysis Repository
Data access layer for the document (PDF/Office) verification module.
Reuses the generic analysis_jobs / evidence_items / reports tables (the same
ones the image module writes to) with module_type="document", instead of
dedicated document_* tables — no separate migration required.
"""
from __future__ import annotations

from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

from backend.database.supabase_client import get_supabase_client
from backend.core.logging import get_logger

logger = get_logger(__name__)


class DocumentRepository:
    """Repository for document analysis data access."""

    def __init__(self):
        self._client = None

    def _table(self, name: str):
        if self._client is None:
            self._client = get_supabase_client()
        return self._client.schema("public").table(name)

    async def create_analysis(
        self,
        user_id: str,
        original_filename: str,
        storage_path: str,
        file_size: int,
        content_type: str,
    ) -> Dict[str, Any]:
        """Create a new document analysis record in analysis_jobs."""
        try:
            now = datetime.now(timezone.utc).isoformat()
            record = {
                "user_id": user_id,
                "module_type": "document",
                "input_type": "file:document",
                "input_content": storage_path,
                "title": original_filename,
                "status": "queued",
                "progress": 0,
                "extra_metadata": {
                    "original_filename": original_filename,
                    "storage_path": storage_path,
                    "file_size": file_size,
                    "content_type": content_type,
                },
                "created_at": now,
                "updated_at": now,
            }
            result = self._table("analysis_jobs").insert(record).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"[DocumentRepository] Failed to create analysis: {e}")
            raise

    async def get_analysis(self, analysis_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a document analysis by ID."""
        try:
            result = self._table("analysis_jobs").select("*").eq("id", analysis_id).eq("user_id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"[DocumentRepository] Failed to get analysis {analysis_id}: {e}")
            return None

    async def list_analyses(self, user_id: str, limit: int = 20, offset: int = 0,
                             status: Optional[str] = None) -> Dict[str, Any]:
        """List document analyses for a user."""
        try:
            query = self._table("analysis_jobs").select("*", count="exact") \
                .eq("user_id", user_id).eq("module_type", "document") \
                .order("created_at", desc=True).limit(limit).offset(offset)
            if status:
                query = query.eq("status", status)
            result = query.execute()
            return {
                "analyses": result.data or [],
                "count": result.count if hasattr(result, "count") else len(result.data or []),
            }
        except Exception as e:
            logger.error(f"[DocumentRepository] Failed to list analyses: {e}")
            return {"analyses": [], "count": 0}

    async def update_analysis(self, analysis_id: str, **updates) -> bool:
        """Update a document analysis."""
        try:
            # analysis_jobs doesn't have trust_score/document_type/page_count columns;
            # store those inside extra_metadata alongside the recognized columns.
            recognized = {"status", "progress", "overall_confidence", "overall_verdict",
                          "risk_level", "error_message", "current_stage", "completed_at", "started_at"}
            column_updates = {k: v for k, v in updates.items() if k in recognized}
            extra = {k: v for k, v in updates.items() if k not in recognized}

            if "confidence" in extra:
                column_updates["overall_confidence"] = extra.pop("confidence")
            if "verdict" in extra:
                column_updates["overall_verdict"] = extra.pop("verdict")

            column_updates["updated_at"] = datetime.now(timezone.utc).isoformat()
            if extra:
                existing_result = self._table("analysis_jobs").select("extra_metadata").eq("id", analysis_id).execute()
                existing_meta = (existing_result.data[0].get("extra_metadata") if existing_result.data else None) or {}
                column_updates["extra_metadata"] = {**existing_meta, **extra}

            self._table("analysis_jobs").update(column_updates).eq("id", analysis_id).execute()
            return True
        except Exception as e:
            logger.error(f"[DocumentRepository] Failed to update analysis {analysis_id}: {e}")
            return False

    async def update_status(self, analysis_id: str, status: str, progress: int = 0) -> bool:
        """Update analysis status and progress."""
        return await self.update_analysis(analysis_id, status=status, progress=progress)

    async def save_evidence(self, analysis_id: str, evidence_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save a document evidence item into evidence_items."""
        try:
            record = {
                "analysis_id": analysis_id,
                "agent_name": evidence_data.get("agent_name", "unknown"),
                "evidence_type": evidence_data.get("evidence_type", "general"),
                "key": evidence_data.get("key", "general"),
                "value": evidence_data.get("value") or str(evidence_data.get("metadata", ""))[:2000],
                "confidence": evidence_data.get("confidence"),
            }
            result = self._table("evidence_items").insert(record).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"[DocumentRepository] Failed to save evidence: {e}")
            return {}

    async def get_evidence(self, analysis_id: str) -> List[Dict[str, Any]]:
        """Get all evidence for an analysis."""
        try:
            result = self._table("evidence_items").select("*").eq("analysis_id", analysis_id).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"[DocumentRepository] Failed to get evidence: {e}")
            return []

    async def save_report(self, user_id: str, analysis_id: str, report_data: Dict[str, Any],
                           pdf_path: str = "", pdf_url: str = "") -> Dict[str, Any]:
        """Save document analysis report."""
        try:
            now = datetime.now(timezone.utc).isoformat()
            record = {
                "user_id": user_id,
                "analysis_id": analysis_id,
                "report_id": f"VX-DOC-{analysis_id[:8].upper()}",
                "title": report_data.get("document_type", "Document Analysis Report"),
                "trust_score": report_data.get("trust_score", 0),
                "authenticity_status": report_data.get("verdict", ""),
                "risk_level": report_data.get("risk_level", "medium"),
                "verdict": report_data.get("verdict", ""),
                "report_data": report_data,
                "pdf_url": pdf_url,
                "pdf_path": pdf_path or pdf_url,
                "created_at": now,
                "updated_at": now,
            }
            result = self._table("reports").insert(record).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"[DocumentRepository] Failed to save report: {e}")
            return {}

    async def get_report(self, analysis_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get document analysis report."""
        try:
            result = self._table("reports").select("*").eq("analysis_id", analysis_id).eq("user_id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"[DocumentRepository] Failed to get report: {e}")
            return None

    async def list_reports(self, user_id: str, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        """List document reports for a user (joins via analysis_jobs.module_type)."""
        try:
            jobs = self._table("analysis_jobs").select("id").eq("user_id", user_id).eq("module_type", "document").execute()
            job_ids = [j["id"] for j in (jobs.data or [])]
            if not job_ids:
                return {"reports": [], "count": 0}
            result = self._table("reports").select("*", count="exact") \
                .in_("analysis_id", job_ids).order("created_at", desc=True).limit(limit).offset(offset).execute()
            return {
                "reports": result.data or [],
                "count": result.count if hasattr(result, "count") else len(result.data or []),
            }
        except Exception as e:
            logger.error(f"[DocumentRepository] Failed to list reports: {e}")
            return {"reports": [], "count": 0}

    async def get_dashboard_stats(self, user_id: str) -> Dict[str, Any]:
        """Get dashboard statistics for document analyses."""
        try:
            result = self._table("analysis_jobs").select("*", count="exact").eq("user_id", user_id).eq("module_type", "document").execute()
            analyses = result.data or []

            total = len(analyses)
            completed = sum(1 for a in analyses if a.get("status") == "completed")
            processing = sum(1 for a in analyses if a.get("status") == "processing")
            queued = sum(1 for a in analyses if a.get("status") == "queued")
            failed = sum(1 for a in analyses if a.get("status") == "failed")

            confidences = [a.get("overall_confidence", 0) or 0 for a in analyses if a.get("status") == "completed" and a.get("overall_confidence") is not None]
            avg_confidence = round(sum(confidences) / len(confidences), 2) if confidences else 0

            risk_dist = {"minimal": 0, "low": 0, "medium": 0, "high": 0, "critical": 0}
            for a in analyses:
                rl = a.get("risk_level", "medium")
                if rl in risk_dist:
                    risk_dist[rl] += 1

            list_reports_result = await self.list_reports(user_id, limit=1)
            total_reports = list_reports_result.get("count", 0)

            return {
                "total_analyses": total,
                "completed_analyses": completed,
                "processing_analyses": processing,
                "queued_analyses": queued,
                "failed_analyses": failed,
                "total_reports": total_reports,
                "average_trust_score": 0,
                "average_confidence": avg_confidence,
                "risk_distribution": risk_dist,
            }
        except Exception as e:
            logger.error(f"[DocumentRepository] Failed to get dashboard stats: {e}")
            return {
                "total_analyses": 0, "completed_analyses": 0, "processing_analyses": 0,
                "queued_analyses": 0, "failed_analyses": 0, "total_reports": 0,
                "average_trust_score": 0, "average_confidence": 0,
                "risk_distribution": {"minimal": 0, "low": 0, "medium": 0, "high": 0, "critical": 0},
            }

    async def delete_analysis(self, analysis_id: str, user_id: str) -> bool:
        """Delete a document analysis and all related data."""
        try:
            self._table("evidence_items").delete().eq("analysis_id", analysis_id).execute()
            self._table("reports").delete().eq("analysis_id", analysis_id).execute()
            self._table("analysis_jobs").delete().eq("id", analysis_id).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            logger.error(f"[DocumentRepository] Failed to delete analysis {analysis_id}: {e}")
            return False


# Global instance
document_repository = DocumentRepository()
