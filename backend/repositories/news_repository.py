"""
News Repository - Data access for news analyses.
Migrated from working news/repository.py
"""

from __future__ import annotations

import os
import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid as uuid_lib

from supabase import create_client, Client

from backend.news.models import (
    NewsAnalysis, NewsAgentResult, NewsSource, NewsClaim, NewsReport
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


class NewsRepository:
    """Database operations for News Verification module."""

    def __init__(self):
        self._client: Optional[Client] = None

    def initialize(self):
        if self._client:
            return
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
        if not supabase_url or not supabase_key:
            raise RuntimeError(
                "Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables."
            )
        self._client = create_client(supabase_url, supabase_key)
        logger.info("News repository initialized")

    @property
    def client(self) -> Client:
        if self._client is None:
            self.initialize()
        if self._client is None:
            raise RuntimeError("Supabase client not initialized")
        return self._client

    def _table(self, name: str):
        """Get table reference with visionx schema."""
        return self.client.schema("visionx").table(name)

    # === NEWS ANALYSIS ===

    def create_analysis(self, analysis: NewsAnalysis) -> Optional[NewsAnalysis]:
        try:
            data = serialize(analysis.dict(exclude={"id"}))
            data["id"] = analysis.id
            result = self._table("news_analyses").insert(data).execute()
            if result.data:
                return NewsAnalysis.from_db(result.data[0])
            return analysis
        except Exception as e:
            logger.exception(f"Failed to create news analysis: {e}")
            raise

    def get_analysis(self, analysis_id: str, user_id: str) -> Optional[NewsAnalysis]:
        try:
            result = self._table("news_analyses")\
                .select("*")\
                .eq("id", analysis_id)\
                .eq("user_id", user_id)\
                .execute()
            if result.data:
                return NewsAnalysis.from_db(result.data[0])
            return None
        except Exception as e:
            logger.exception(f"Failed to get news analysis {analysis_id}: {e}")
            return None

    def update_analysis(self, analysis_id: str, updates: Dict[str, Any]) -> bool:
        try:
            sanitized = dict(updates)
            for ts_field in ("completed_at", "created_at", "updated_at"):
                val = sanitized.get(ts_field)
                if isinstance(val, str) and "," in val:
                    sanitized[ts_field] = val.replace(",", ".")
            self._table("news_analyses").update(serialize(sanitized)).eq("id", analysis_id).execute()
            return True
        except Exception as e:
            logger.exception(f"Failed to update news analysis {analysis_id}: {e}")
            return False

    def list_analyses(self, user_id: str, limit: int = 20, offset: int = 0) -> List[NewsAnalysis]:
        try:
            result = self._table("news_analyses")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .offset(offset)\
                .execute()
            if result.data:
                return [NewsAnalysis.from_db(r) for r in result.data]
            return []
        except Exception as e:
            logger.exception(f"Failed to list news analyses: {e}")
            return []

    def delete_analysis(self, analysis_id: str, user_id: str) -> bool:
        try:
            self._table("news_analyses").delete().eq("id", analysis_id).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            logger.exception(f"Failed to delete news analysis {analysis_id}: {e}")
            return False

    # === AGENT RESULTS ===

    def save_agent_result(self, agent_result: NewsAgentResult) -> bool:
        try:
            data = {
                "id": agent_result.id,
                "news_analysis_id": agent_result.news_analysis_id,
                "agent": agent_result.agent,
                "status": agent_result.status,
                "confidence": agent_result.confidence,
                "findings": json.dumps(serialize(agent_result.findings), default=str),
                "evidence": json.dumps(serialize(agent_result.evidence), default=str),
                "error": agent_result.error,
                "processing_time_ms": agent_result.processing_time_ms,
                "created_at": agent_result.created_at,
            }
            self._table("news_agent_results").insert(data).execute()
            return True
        except Exception as e:
            logger.exception(f"Failed to save agent result: {e}")
            return False

    def get_agent_results(self, news_analysis_id: str, user_id: str) -> List[NewsAgentResult]:
        try:
            result = self._table("news_agent_results")\
                .select("*")\
                .eq("news_analysis_id", news_analysis_id)\
                .execute()
            if result.data:
                return [NewsAgentResult.from_db(r) for r in result.data]
            return []
        except Exception as e:
            logger.exception(f"Failed to get agent results: {e}")
            return []

    # === SOURCES ===

    def save_source(self, source: NewsSource) -> bool:
        try:
            data = serialize(source.dict())
            self._table("news_sources").insert(data).execute()
            return True
        except Exception as e:
            logger.exception(f"Failed to save source: {e}")
            return False

    def get_sources(self, news_analysis_id: str, user_id: str) -> List[NewsSource]:
        try:
            result = self._table("news_sources")\
                .select("*")\
                .eq("news_analysis_id", news_analysis_id)\
                .execute()
            if result.data:
                return [NewsSource(**r) for r in result.data]
            return []
        except Exception as e:
            logger.exception(f"Failed to get sources: {e}")
            return []

    # === CLAIMS ===

    def save_claim(self, claim: NewsClaim) -> bool:
        try:
            data = serialize(claim.dict())
            self._table("news_claims").insert(data).execute()
            return True
        except Exception as e:
            logger.exception(f"Failed to save claim: {e}")
            return False

    def get_claims(self, news_analysis_id: str, user_id: str) -> List[NewsClaim]:
        try:
            result = self._table("news_claims")\
                .select("*")\
                .eq("news_analysis_id", news_analysis_id)\
                .execute()
            if result.data:
                return [NewsClaim.from_db(r) for r in result.data]
            return []
        except Exception as e:
            logger.exception(f"Failed to get claims: {e}")
            return []

    # === REPORTS ===

    def save_report(self, report: NewsReport) -> bool:
        try:
            data = serialize(report.dict())
            # Drop columns that may be missing from current news_reports schema
            data.pop("report_data", None)
            data.pop("authenticity_status", None)
            self._table("news_reports").insert(data).execute()
            return True
        except Exception as e:
            logger.exception(f"Failed to save news report: {e}")
            return False

    def get_report(self, report_id: str, user_id: str) -> Optional[NewsReport]:
        try:
            result = self._table("news_reports")\
                .select("*")\
                .eq("id", report_id)\
                .eq("user_id", user_id)\
                .execute()
            if result.data:
                return NewsReport.from_db(result.data[0])
            return None
        except Exception as e:
            logger.exception(f"Failed to get news report: {e}")
            return None

    def get_report_by_analysis_id(self, news_analysis_id: str, user_id: str) -> Optional[NewsReport]:
        try:
            result = self._table("news_reports")\
                .select("*")\
                .eq("news_analysis_id", news_analysis_id)\
                .eq("user_id", user_id)\
                .execute()
            if result.data:
                return NewsReport.from_db(result.data[0])
            return None
        except Exception as e:
            logger.exception(f"Failed to get news report by analysis_id: {e}")
            return None

    def list_reports(self, user_id: str, limit: int = 20, offset: int = 0) -> List[NewsReport]:
        try:
            result = self._table("news_reports")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .offset(offset)\
                .execute()
            if result.data:
                return [NewsReport.from_db(r) for r in result.data]
            return []
        except Exception as e:
            logger.exception(f"Failed to list news reports: {e}")
            return []

    # === DASHBOARD STATS ===

    def get_dashboard_stats(self, user_id: str) -> Dict[str, Any]:
        try:
            analyses = self._table("news_analyses")\
                .select("*")\
                .eq("user_id", user_id)\
                .execute()

            if not analyses.data:
                return self._empty_stats()

            total = len(analyses.data)
            completed = sum(1 for a in analyses.data if a.get("status") == "completed")
            processing = sum(1 for a in analyses.data if a.get("status") == "processing")
            failed = sum(1 for a in analyses.data if a.get("status") == "failed")

            authenticity_scores = [
                a.get("authenticity_score", 0) or 0
                for a in analyses.data
                if a.get("status") == "completed" and a.get("authenticity_score") is not None
            ]
            avg_score = round(sum(authenticity_scores) / len(authenticity_scores), 1) if authenticity_scores else 0

            risk_dist = {"minimal": 0, "low": 0, "medium": 0, "high": 0, "critical": 0}
            for a in analyses.data:
                rl = a.get("risk_level", "")
                if rl in risk_dist:
                    risk_dist[rl] += 1

            authenticity_dist = {"likely_true": 0, "mostly_true": 0, "needs_verification": 0, "likely_false": 0, "false": 0}
            for a in analyses.data:
                al = a.get("authenticity_level", "")
                if al in authenticity_dist:
                    authenticity_dist[al] += 1

            reports_count = 0
            reports_result = self._table("news_reports")\
                .select("id", count="exact")\
                .eq("user_id", user_id)\
                .execute()
            if hasattr(reports_result, 'count'):
                reports_count = reports_result.count

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
                "average_authenticity_score": avg_score,
                "risk_distribution": risk_dist,
                "authenticity_distribution": authenticity_dist,
                "total_reports": reports_count,
                "recent_analyses": [
                    {
                        "id": a.get("id"),
                        "input_type": a.get("input_type"),
                        "title": a.get("title"),
                        "status": a.get("status"),
                        "authenticity_score": a.get("authenticity_score"),
                        "risk_level": a.get("risk_level"),
                        "created_at": a.get("created_at"),
                    }
                    for a in recent
                ],
            }
        except Exception as e:
            logger.exception(f"Failed to get news dashboard stats: {e}")
            return self._empty_stats()

    def _empty_stats(self) -> Dict[str, Any]:
        return {
            "total_analyses": 0,
            "completed_analyses": 0,
            "processing_analyses": 0,
            "failed_analyses": 0,
            "average_authenticity_score": 0,
            "risk_distribution": {"minimal": 0, "low": 0, "medium": 0, "high": 0, "critical": 0},
            "authenticity_distribution": {"likely_true": 0, "mostly_true": 0, "needs_verification": 0, "likely_false": 0, "false": 0},
            "total_reports": 0,
            "recent_analyses": [],
        }


# Singleton
news_db = NewsRepository()