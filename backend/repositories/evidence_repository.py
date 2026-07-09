"""
Evidence Repository - Data access for analysis evidence.
"""

from __future__ import annotations

import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime

from supabase import Client

from backend.ai_v2.models import AnalysisEvidence

logger = logging.getLogger(__name__)


class EvidenceRepository:
    """Repository for analysis evidence."""

    def __init__(self, client: Client):
        self._client = client

    def _table(self, name: str):
        """Get table reference with visionx schema."""
        return self._client.schema("visionx").table(name)

    def save_evidence(self, evidence: AnalysisEvidence) -> bool:
        """Save evidence."""
        try:
            data = {
                "id": evidence.id,
                "analysis_id": evidence.analysis_id,
                "evidence_type": evidence.evidence_type,
                "evidence_data": json.dumps(evidence.evidence_data, default=str),
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

    def delete_evidence(self, evidence_id: str, user_id: str) -> bool:
        """Delete evidence."""
        try:
            self._table("analysis_evidence").delete().eq("id", evidence_id).execute()
            return True
        except Exception as e:
            logger.exception(f"Failed to delete evidence: {e}")
            return False


# Singleton will be initialized with client
evidence_repository = None


def init_evidence_repository(client: Client) -> EvidenceRepository:
    """Initialize evidence repository with Supabase client."""
    global evidence_repository
    evidence_repository = EvidenceRepository(client)
    return evidence_repository