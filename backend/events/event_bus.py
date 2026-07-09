"""
VisionX Event Bus — Production-ready event system.
Implements publish, subscribe, SSE streaming, history, and cleanup.
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, Dict, Optional, Set, Callable, List
from datetime import datetime, timezone
from collections import defaultdict
from dataclasses import dataclass, field
import weakref

logger = logging.getLogger(__name__)


@dataclass
class Event:
    """Event data structure."""
    type: str
    analysis_id: Optional[str] = None
    data: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    
    def to_sse_message(self) -> str:
        """Convert to SSE format."""
        payload = {
            "type": self.type,
            "analysis_id": self.analysis_id,
            "data": self.data,
            "timestamp": self.timestamp.isoformat()
        }
        return f"event: {self.type}\ndata: {json.dumps(payload, default=str)}\n\n"


@dataclass
class EventHistory:
    """Event history entry."""
    event: Event
    subscribers_notified: int = 0


class EventBus:
    """
    Production-ready event bus with:
    - In-memory event publishing and subscription
    - SSE queue management with cleanup
    - Event history tracking
    - Heartbeat support
    - Graceful reconnection handling
    """

    def __init__(self, max_history: int = 10000):
        self._subscribers: Dict[str, Set[Callable]] = defaultdict(set)
        self._sse_queues: Dict[str, asyncio.Queue] = {}
        self._sse_subscribers: Dict[str, weakref.ref] = {}
        self._history: List[EventHistory] = []
        self._max_history = max_history
        self._heartbeat_interval = 30.0  # seconds
        self._heartbeat_tasks: Dict[str, asyncio.Task] = {}

    # ============================================================================
    # Core publish / subscribe
    # ============================================================================

    async def publish(self, event_type: str, data: Dict[str, Any],
                     analysis_id: Optional[str] = None) -> None:
        """
        Publish event to all subscribers.
        
        Args:
            event_type: Event type identifier
            data: Event payload
            analysis_id: Optional analysis ID for SSE routing
        """
        event = Event(type=event_type, analysis_id=analysis_id, data=data)
        
        # Store in history
        history_entry = EventHistory(event=event)
        self._history.append(history_entry)
        
        # Trim history if needed
        if len(self._history) > self._max_history:
            self._history.pop(0)
        
        # Notify in-memory subscribers
        callbacks = self._subscribers.get(event_type, set())
        for callback in callbacks:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(event)
                else:
                    callback(event)
                history_entry.subscribers_notified += 1
            except Exception as e:
                logger.error(f"Error notifying subscriber for {event_type}: {e}")
        
        # Notify SSE subscribers for this analysis_id
        if analysis_id and analysis_id in self._sse_queues:
            try:
                queue = self._sse_queues[analysis_id]
                await queue.put(event.to_sse_message())
            except Exception as e:
                logger.error(f"Error sending SSE for {analysis_id}: {e}")

    def subscribe(self, event_type: str, callback: Callable) -> None:
        """
        Subscribe to events by type.
        
        Args:
            event_type: Event type to subscribe to
            callback: Function or coroutine to call with Event
        """
        self._subscribers[event_type].add(callback)

    def unsubscribe(self, event_type: str, callback: Callable) -> None:
        """Unsubscribe from event type."""
        self._subscribers.get(event_type, set()).discard(callback)

    # ============================================================================
    # SSE streaming
    # ============================================================================

    async def subscribe_sse(self, analysis_id: str) -> asyncio.Queue:
        """
        Subscribe to SSE stream for analysis.
        
        Args:
            analysis_id: Analysis ID to stream events for
            
        Returns:
            Queue of SSE-formatted messages
        """
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        self._sse_queues[analysis_id] = queue
        
        # Start heartbeat task for this subscriber
        self._heartbeat_tasks[analysis_id] = asyncio.create_task(
            self._heartbeat_sender(analysis_id, queue)
        )
        
        logger.info(f"SSE subscriber connected for analysis {analysis_id}")
        return queue

    async def unsubscribe_sse(self, analysis_id: str, queue: asyncio.Queue) -> None:
        """
        Unsubscribe from SSE stream.
        
        Args:
            analysis_id: Analysis ID
            queue: Queue to close
        """
        # Cancel heartbeat task
        if analysis_id in self._heartbeat_tasks:
            task = self._heartbeat_tasks.pop(analysis_id)
            task.cancel()
        
        # Remove queue
        self._sse_queues.pop(analysis_id, None)
        self._sse_subscribers.pop(analysis_id, None)
        
        logger.info(f"SSE subscriber disconnected for analysis {analysis_id}")

    async def _heartbeat_sender(self, analysis_id: str, queue: asyncio.Queue) -> None:
        """Send periodic heartbeats to keep SSE connection alive."""
        try:
            while True:
                await asyncio.sleep(self._heartbeat_interval)
                try:
                    await queue.put(f": heartbeat\n\n")
                except asyncio.QueueFull:
                    logger.warning(f"SSE queue full for {analysis_id}")
        except asyncio.CancelledError:
            pass

    # ============================================================================
    # Event history
    # ============================================================================

    def get_history(self, analysis_id: Optional[str] = None,
                    limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get event history.
        
        Args:
            analysis_id: Optional filter by analysis ID
            limit: Maximum events to return
            
        Returns:
            List of event dictionaries
        """
        if analysis_id:
            events = [
                {
                    "type": h.event.type,
                    "analysis_id": h.event.analysis_id,
                    "data": h.event.data,
                    "timestamp": h.event.timestamp.isoformat()
                }
                for h in self._history
                if h.event.analysis_id == analysis_id
            ]
        else:
            events = [
                {
                    "type": h.event.type,
                    "analysis_id": h.event.analysis_id,
                    "data": h.event.data,
                    "timestamp": h.event.timestamp.isoformat()
                }
                for h in self._history
            ]
        
        # Return most recent first
        return events[-limit:][::-1]

    def clear_history(self, analysis_id: Optional[str] = None) -> None:
        """Clear event history."""
        if analysis_id:
            self._history = [h for h in self._history
                           if h.event.analysis_id != analysis_id]
        else:
            self._history.clear()

    # ============================================================================
    # Convenience methods for common events
    # ============================================================================

    async def publish_analysis_created(self, analysis_id: str, module: str = "image",
                                       user_id: str = "", **kwargs) -> None:
        """Publish analysis created event."""
        await self.publish(
            event_type="analysis.created",
            analysis_id=analysis_id,
            data={
                "analysis_id": analysis_id,
                "module": module,
                "user_id": user_id,
                **kwargs
            }
        )

    async def publish_analysis_started(self, analysis_id: str, module: str = "image",
                                       total_agents: int = 0, **kwargs) -> None:
        """Publish analysis started event."""
        await self.publish(
            event_type="analysis.started",
            analysis_id=analysis_id,
            data={
                "analysis_id": analysis_id,
                "module": module,
                "total_agents": total_agents,
                "progress": 0,
                **kwargs
            }
        )

    async def publish_analysis_progress(self, analysis_id: str, progress: int,
                                        current_agent: str = "", current_stage: str = "",
                                        **kwargs) -> None:
        """Publish analysis progress event."""
        await self.publish(
            event_type="analysis.progress",
            analysis_id=analysis_id,
            data={
                "analysis_id": analysis_id,
                "progress": progress,
                "current_agent": current_agent,
                "current_stage": current_stage,
                **kwargs
            }
        )

    async def publish_analysis_completed(self, analysis_id: str, verdict: str = "",
                                         confidence: float = 0.0, processing_time_ms: float = 0.0,
                                         **kwargs) -> None:
        """Publish analysis completed event."""
        await self.publish(
            event_type="analysis.completed",
            analysis_id=analysis_id,
            data={
                "analysis_id": analysis_id,
                "verdict": verdict,
                "confidence": confidence,
                "processing_time_ms": processing_time_ms,
                "progress": 100,
                **kwargs
            }
        )

    async def publish_analysis_failed(self, analysis_id: str, error: str = "",
                                      **kwargs) -> None:
        """Publish analysis failed event."""
        await self.publish(
            event_type="analysis.failed",
            analysis_id=analysis_id,
            data={
                "analysis_id": analysis_id,
                "error": error,
                **kwargs
            }
        )

    async def publish_agent_started(self, analysis_id: str, agent_name: str,
                                   **kwargs) -> None:
        """Publish agent started event."""
        await self.publish(
            event_type="agent.started",
            analysis_id=analysis_id,
            data={
                "analysis_id": analysis_id,
                "agent_name": agent_name,
                **kwargs
            }
        )

    async def publish_agent_completed(self, analysis_id: str, agent_name: str,
                                     confidence: float = 0.0, summary: str = "",
                                     **kwargs) -> None:
        """Publish agent completed event."""
        await self.publish(
            event_type="agent.completed",
            analysis_id=analysis_id,
            data={
                "analysis_id": analysis_id,
                "agent_name": agent_name,
                "confidence": confidence,
                "summary": summary,
                **kwargs
            }
        )

    async def publish_agent_failed(self, analysis_id: str, agent_name: str,
                                  error: str = "", **kwargs) -> None:
        """Publish agent failed event."""
        await self.publish(
            event_type="agent.failed",
            analysis_id=analysis_id,
            data={
                "analysis_id": analysis_id,
                "agent_name": agent_name,
                "error": error,
                **kwargs
            }
        )

    async def publish_evidence_collected(self, analysis_id: str, agent_name: str,
                                        evidence_type: str, **kwargs) -> None:
        """Publish evidence collected event."""
        await self.publish(
            event_type="evidence.collected",
            analysis_id=analysis_id,
            data={
                "analysis_id": analysis_id,
                "agent_name": agent_name,
                "evidence_type": evidence_type,
                **kwargs
            }
        )

    async def publish_decision_generated(self, analysis_id: str, verdict: str = "",
                                         risk_level: str = "", trust_score: float = 0.0,
                                         **kwargs) -> None:
        """Publish decision generated event."""
        await self.publish(
            event_type="decision.generated",
            analysis_id=analysis_id,
            data={
                "analysis_id": analysis_id,
                "verdict": verdict,
                "risk_level": risk_level,
                "trust_score": trust_score,
                **kwargs
            }
        )

    async def publish_report_generated(self, analysis_id: str, report_id: str = "",
                                       **kwargs) -> None:
        """Publish report generated event."""
        await self.publish(
            event_type="report.generated",
            analysis_id=analysis_id,
            data={
                "analysis_id": analysis_id,
                "report_id": report_id,
                **kwargs
            }
        )

    # ============================================================================
    # Reconnection support
    # ============================================================================

    def get_active_connections(self) -> List[str]:
        """Get list of active SSE connection analysis IDs."""
        return list(self._sse_queues.keys())

    async def reconnect(self, analysis_id: str) -> Optional[asyncio.Queue]:
        """
        Reconnect to SSE stream for analysis.
        
        Args:
            analysis_id: Analysis ID to reconnect to
            
        Returns:
            New SSE queue if reconnected, None if no active connection
        """
        if analysis_id in self._sse_queues:
            queue = self._sse_queues[analysis_id]
            return queue
        return None

    # ============================================================================
    # Cleanup
    # ============================================================================

    async def cleanup_analysis(self, analysis_id: str) -> None:
        """
        Clean up all resources for an analysis.
        
        Args:
            analysis_id: Analysis ID to cleanup
        """
        # Cancel heartbeat
        if analysis_id in self._heartbeat_tasks:
            task = self._heartbeat_tasks.pop(analysis_id)
            task.cancel()
        
        # Close queue
        self._sse_queues.pop(analysis_id, None)
        self._sse_subscribers.pop(analysis_id, None)
        
        logger.info(f"Cleaned up resources for analysis {analysis_id}")

    async def shutdown(self) -> None:
        """Shutdown event bus, cancel all tasks."""
        # Cancel all heartbeat tasks
        for task in self._heartbeat_tasks.values():
            task.cancel()
        self._heartbeat_tasks.clear()
        
        # Clear all queues
        self._sse_queues.clear()
        self._sse_subscribers.clear()
        
        logger.info("Event bus shutdown complete")


# Singleton instance
event_bus = EventBus()