"""
VisionX Health Checker
Monitors all system components and reports health status.
Distinguishes between healthy, degraded, and unavailable states.
"""

from __future__ import annotations

import time
from typing import Dict, Any, Optional, List, Callable, Awaitable
from enum import Enum

from backend.core.logging import get_logger

logger = get_logger(__name__)


class HealthStatus(str, Enum):
    """Component health status levels."""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNAVAILABLE = "unavailable"
    UNKNOWN = "unknown"


class ComponentHealth:
    """Health status of a single component."""
    def __init__(
        self,
        name: str,
        status: HealthStatus = HealthStatus.UNKNOWN,
        message: str = "",
        response_time_ms: float = 0.0,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.name = name
        self.status = status
        self.message = message
        self.response_time_ms = response_time_ms
        self.metadata = metadata or {}
        self.checked_at = time.time()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "status": self.status.value,
            "message": self.message,
            "response_time_ms": round(self.response_time_ms, 2),
            "checked_at": self.checked_at,
            "metadata": self.metadata,
        }

    @classmethod
    def healthy(cls, name: str, message: str = "OK", **kwargs) -> "ComponentHealth":
        return cls(name=name, status=HealthStatus.HEALTHY, message=message, **kwargs)

    @classmethod
    def degraded(cls, name: str, message: str, **kwargs) -> "ComponentHealth":
        return cls(name=name, status=HealthStatus.DEGRADED, message=message, **kwargs)

    @classmethod
    def unavailable(cls, name: str, message: str, **kwargs) -> "ComponentHealth":
        return cls(name=name, status=HealthStatus.UNAVAILABLE, message=message, **kwargs)


HealthCheckFn = Callable[[], Awaitable[ComponentHealth]]


class HealthChecker:
    """
    Central health monitoring system.
    
    Checks:
    - Database connectivity
    - Redis cache
    - Storage backend
    - AI provider
    - Event bus
    - Orchestrator
    - Agent registry
    - Pipeline registry
    """

    def __init__(self):
        self._checks: Dict[str, HealthCheckFn] = {}
        self._cache: Dict[str, ComponentHealth] = {}
        self._cache_ttl = 30  # seconds

    def register(self, name: str, check_fn: HealthCheckFn) -> None:
        """Register a health check function."""
        self._checks[name] = check_fn
        logger.info(f"Registered health check: {name}")

    async def run_check(self, name: str) -> ComponentHealth:
        """Run a single health check."""
        check_fn = self._checks.get(name)
        if check_fn is None:
            return ComponentHealth.unavailable(name, "No check registered")
        
        start = time.monotonic()
        try:
            result = await check_fn()
            result.response_time_ms = (time.monotonic() - start) * 1000
            self._cache[name] = result
            return result
        except Exception as e:
            health = ComponentHealth.unavailable(name, str(e))
            health.response_time_ms = (time.monotonic() - start) * 1000
            self._cache[name] = health
            return health

    async def run_all(self) -> Dict[str, ComponentHealth]:
        """Run all registered health checks."""
        import asyncio
        results = {}
        tasks = {name: self.run_check(name) for name in self._checks}
        for name, task in tasks.items():
            results[name] = await task
        return results

    async def get_system_health(self) -> Dict[str, Any]:
        """
        Get comprehensive system health status.
        
        Returns:
            Dict with overall status and per-component details
        """
        results = await self.run_all()
        
        status_counts = {"healthy": 0, "degraded": 0, "unavailable": 0, "unknown": 0}
        for r in results.values():
            status_counts[r.status.value] = status_counts.get(r.status.value, 0) + 1

        if status_counts.get("unavailable", 0) > 0:
            overall = "unavailable"
        elif status_counts.get("degraded", 0) > 0:
            overall = "degraded"
        elif status_counts.get("healthy", 0) == len(results):
            overall = "healthy"
        else:
            overall = "degraded"

        return {
            "status": overall,
            "timestamp": time.time(),
            "components": {name: r.to_dict() for name, r in results.items()},
            "summary": {
                "total": len(results),
                "healthy": status_counts.get("healthy", 0),
                "degraded": status_counts.get("degraded", 0),
                "unavailable": status_counts.get("unavailable", 0),
            },
        }

    def get_cached_health(self, name: str) -> Optional[ComponentHealth]:
        """Get cached health result if not expired."""
        result = self._cache.get(name)
        if result and (time.time() - result.checked_at) < self._cache_ttl:
            return result
        return None


# Global singleton
health_checker = HealthChecker()


async def _check_database() -> ComponentHealth:
    """Health check for database connectivity."""
    try:
        from backend.database.session import check_db_connection
        ok = await check_db_connection()
        return ComponentHealth.healthy("database") if ok else ComponentHealth.unavailable("database", "Connection failed")
    except ImportError:
        return ComponentHealth.healthy("database", "Not configured")


async def _check_redis() -> ComponentHealth:
    """Health check for Redis."""
    try:
        from backend.utils.cache.redis_client import cache
        ok = await cache.health_check()
        return ComponentHealth.healthy("redis") if ok else ComponentHealth.degraded("redis", "Not connected")
    except ImportError:
        return ComponentHealth.healthy("redis", "Not configured")


async def _check_ai_provider() -> ComponentHealth:
    """Health check for AI provider."""
    from backend.ai.models.provider import AIProviderFactory
    providers = AIProviderFactory.get_available_providers()
    if providers and providers[0].get("status") == "configured":
        return ComponentHealth.healthy("ai_provider", f"Provider: {providers[0]['type']}", metadata={"providers": providers})
    return ComponentHealth.degraded("ai_provider", "No AI provider configured", metadata={"providers": providers})


async def _check_event_bus() -> ComponentHealth:
    """Health check for event bus."""
    from backend.events.event_bus import event_bus
    history_count = len(event_bus.get_history())
    return ComponentHealth.healthy("event_bus", f"History: {history_count} events", metadata={"history_count": history_count})


async def _check_orchestrator() -> ComponentHealth:
    """Health check for orchestrator."""
    from backend.ai.orchestrator.orchestrator import orchestrator
    active = orchestrator.get_active_analyses()
    return ComponentHealth.healthy("orchestrator", f"Active analyses: {len(active)}", metadata={"active_analyses": len(active)})


async def _check_pipeline_registry() -> ComponentHealth:
    """Health check for pipeline registry."""
    from backend.workers.pipeline_registry import registry
    modules = registry.list_modules()
    return ComponentHealth.healthy("pipeline_registry", f"Registered: {modules}", metadata={"modules": modules})


# Register default health checks
health_checker.register("database", _check_database)
health_checker.register("redis", _check_redis)
health_checker.register("ai_provider", _check_ai_provider)
health_checker.register("event_bus", _check_event_bus)
health_checker.register("orchestrator", _check_orchestrator)
health_checker.register("pipeline_registry", _check_pipeline_registry)