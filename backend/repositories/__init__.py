"""
Repositories initialization.
Repositories are initialized lazily when Supabase client becomes available.
"""

from typing import Optional, Dict, Any, List
from supabase import Client

# Repository module references
try:
    from backend.repositories.incident_repository import (
        IncidentRepository as _IncidentRepository,
        init_incident_repository as _init_incident,
    )
except Exception:
    _IncidentRepository = None
    _init_incident = None

try:
    from backend.repositories.report_repository import (
        ReportRepository as _ReportRepository,
        init_report_repository as _init_report,
    )
except Exception:
    _ReportRepository = None
    _init_report = None

# Lazy-loaded repositories (set to None until init is called)
incident_repository = None
report_repository = None
analysis_repository = None
evidence_repository = None
news_repository = None


def init_repositories(client: Client) -> Dict[str, Any]:
    """
    Initialize all repositories with a Supabase client.
    Call this during application startup.
    
    Returns:
        Dict of repository instances
    """
    global incident_repository, report_repository
    global analysis_repository, evidence_repository, news_repository
    
    repos = {}
    
    if _init_incident is not None:
        try:
            incident_repository = _init_incident(client)
            repos["incident_repository"] = incident_repository
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Failed to init incident_repository: {e}")
            repos["incident_repository"] = None
    else:
        repos["incident_repository"] = None
    
    if _init_report is not None:
        try:
            report_repository = _init_report(client)
            repos["report_repository"] = report_repository
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Failed to init report_repository: {e}")
            repos["report_repository"] = None
    else:
        repos["report_repository"] = None
    
    return repos