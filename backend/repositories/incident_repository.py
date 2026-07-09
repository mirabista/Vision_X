"""
Incident Repository - Data access for incidents.
"""

from __future__ import annotations

import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime

from supabase import Client

from backend.ai_v2.models import Incident

logger = logging.getLogger(__name__)


class IncidentRepository:
    """Repository for incidents."""

    def __init__(self, client: Client):
        self._client = client

    def _table(self, name: str):
        """Get table reference with visionx schema."""
        return self._client.schema("visionx").table(name)

    def create_incident(self, incident: Incident) -> bool:
        """Create incident."""
        try:
            data = {
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
            }
            self._table("incidents").insert(data).execute()
            return True
        except Exception as e:
            logger.exception(f"Failed to create incident: {e}")
            return False

    def get_incident(self, incident_id: str, user_id: str) -> Optional[Incident]:
        """Get incident by ID."""
        try:
            result = self._table("incidents")\
                .select("*")\
                .eq("id", incident_id)\
                .eq("user_id", user_id)\
                .execute()
            if result.data:
                return Incident(**result.data[0])
            return None
        except Exception as e:
            logger.exception(f"Failed to get incident: {e}")
            return None

    def list_incidents(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        status: Optional[str] = None
    ) -> List[Incident]:
        """List incidents."""
        try:
            query = self._table("incidents")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .offset(offset)

            if status:
                query = query.eq("status", status)

            result = query.execute()
            if result.data:
                return [Incident.from_db(r) for r in result.data]
            return []
        except Exception as e:
            logger.exception(f"Failed to list incidents: {e}")
            return []

    def update_incident(self, incident_id: str, updates: Dict[str, Any]) -> bool:
        """Update incident."""
        try:
            self._table("incidents")\
                .update(updates)\
                .eq("id", incident_id)\
                .execute()
            return True
        except Exception as e:
            logger.exception(f"Failed to update incident: {e}")
            return False

    def delete_incident(self, incident_id: str, user_id: str) -> bool:
        """Delete incident."""
        try:
            self._table("incidents").delete().eq("id", incident_id).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            logger.exception(f"Failed to delete incident: {e}")
            return False


# Singleton will be initialized with client
incident_repository = None


def init_incident_repository(client: Client) -> IncidentRepository:
    """Initialize incident repository with Supabase client."""
    global incident_repository
    incident_repository = IncidentRepository(client)
    return incident_repository