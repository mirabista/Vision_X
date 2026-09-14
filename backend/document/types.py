"""
Lightweight local types for the document verification pipeline.
Replaces the ai_v2.models dependency used by the upstream agent code with
plain dataclasses that fit this project's existing Supabase-backed pattern.
"""
from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional


@dataclass
class AgentResult:
    agent: str
    status: str = "pending"
    confidence: float = 0.0
    findings: List[str] = field(default_factory=list)
    evidence: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    processing_time_ms: float = 0.0

    def dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Analysis:
    id: str
    user_id: str
    original_filename: str
    storage_path: str
    status: str = "pending"
