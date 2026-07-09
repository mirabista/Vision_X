"""
Base Agent - Abstract base class for all VisionX AI agents.
Provides common error handling, timing, and result formatting.
"""

from __future__ import annotations

import time
import traceback
from typing import Any, Dict, Optional
from backend.core.logging import get_logger

logger = get_logger(__name__)


class BaseAgent:
    """Base class for all analysis agents."""

    def __init__(self, name: str, timeout: int = 30):
        self.name = name
        self.timeout = timeout

    async def execute(self, **kwargs) -> Dict[str, Any]:
        """
        Execute the agent's analysis.
        Wraps the concrete implementation with timing and error handling.
        """
        start = time.time()
        result = {
            "agent_name": self.name,
            "status": "pending",
            "started_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(start)),
            "duration_ms": 0,
            "confidence": 0.0,
            "findings": [],
            "evidence": [],
            "error_message": None,
        }
        try:
            output = await self._run(**kwargs)
            result.update(output)
            result["status"] = "completed"
            result["duration_ms"] = (time.time() - start) * 1000
            logger.info(f"[{self.name}] Completed in {result['duration_ms']:.0f}ms")
        except Exception as e:
            result["status"] = "failed"
            result["error_message"] = str(e)
            result["duration_ms"] = (time.time() - start) * 1000
            result["stack_trace"] = traceback.format_exc()
            logger.error(f"[{self.name}] Failed: {e}")
        return result

    async def _run(self, **kwargs) -> Dict[str, Any]:
        """Concrete implementation - override in subclasses."""
        raise NotImplementedError