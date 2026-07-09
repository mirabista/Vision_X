"""
VisionX WebSocket Event Consumer
Provides real-time analysis progress to the frontend.
Clients subscribe to analysis events via WebSocket.
"""

from __future__ import annotations

import json
import asyncio
from typing import Dict, Any, Set, Optional
from fastapi import WebSocket, WebSocketDisconnect

from backend.core.logging import get_logger
from backend.events.event_bus import EventType, event_bus

logger = get_logger(__name__)


class ConnectionManager:
    """
    Manages WebSocket connections for real-time progress updates.
    
    Supports:
    - Subscribe to a specific analysis
    - Subscribe to all analyses (admin)
    - Receive typed progress events
    - Automatic cleanup on disconnect
    """

    def __init__(self):
        self._analysis_subscriptions: Dict[str, Set[WebSocket]] = {}
        self._admin_subscriptions: Set[WebSocket] = set()

    async def connect_to_analysis(self, websocket: WebSocket, analysis_id: str) -> None:
        """Accept WebSocket and subscribe to an analysis."""
        await websocket.accept()
        
        if analysis_id not in self._analysis_subscriptions:
            self._analysis_subscriptions[analysis_id] = set()
        self._analysis_subscriptions[analysis_id].add(websocket)
        
        logger.info(f"WebSocket connected to analysis: {analysis_id}")
        
        # Send initial connection confirmation
        await self._send_json(websocket, {
            "type": "connection.established",
            "analysis_id": analysis_id,
            "message": "Connected to analysis progress stream",
        })

    async def connect_admin(self, websocket: WebSocket) -> None:
        """Accept WebSocket for all events."""
        await websocket.accept()
        self._admin_subscriptions.add(websocket)
        logger.info("Admin WebSocket connected")

    async def disconnect(self, websocket: WebSocket, analysis_id: Optional[str] = None) -> None:
        """Disconnect and cleanup."""
        self._admin_subscriptions.discard(websocket)
        
        if analysis_id and analysis_id in self._analysis_subscriptions:
            self._analysis_subscriptions[analysis_id].discard(websocket)
            if not self._analysis_subscriptions[analysis_id]:
                del self._analysis_subscriptions[analysis_id]

    async def broadcast_to_analysis(self, analysis_id: str, event: Dict[str, Any]) -> None:
        """Send event to all subscribers of an analysis."""
        # Send to specific analysis subscribers
        if analysis_id in self._analysis_subscriptions:
            disconnected = set()
            for ws in self._analysis_subscriptions[analysis_id]:
                try:
                    await self._send_json(ws, event)
                except Exception:
                    disconnected.add(ws)
            
            for ws in disconnected:
                self._analysis_subscriptions[analysis_id].discard(ws)
        
        # Send to admin subscribers
        disconnected = set()
        for ws in self._admin_subscriptions:
            try:
                await self._send_json(ws, event)
            except Exception:
                disconnected.add(ws)
        
        for ws in disconnected:
            self._admin_subscriptions.discard(ws)

    async def _send_json(self, websocket: WebSocket, data: Dict[str, Any]) -> None:
        """Send JSON through WebSocket."""
        try:
            await websocket.send_json(data)
        except Exception as e:
            logger.warning(f"WebSocket send failed: {e}")
            raise


# Global singleton
connection_manager = ConnectionManager()


class EventConsumerService:
    """
    Listens to the internal event bus and broadcasts to WebSocket subscribers.
    Converts internal events to frontend-friendly format.
    """

    def __init__(self):
        self._running = False
        self._listen_task: Optional[asyncio.Task] = None

    def start(self) -> None:
        """Start listening to event bus."""
        if self._running:
            return
        
        self._running = True
        self._listen_task = asyncio.create_task(self._listen_loop())
        logger.info("Event consumer service started")

    async def stop(self) -> None:
        """Stop listening to event bus."""
        self._running = False
        if self._listen_task:
            self._listen_task.cancel()
            try:
                await self._listen_task
            except asyncio.CancelledError:
                pass
        logger.info("Event consumer service stopped")

    async def _listen_loop(self) -> None:
        """Listen for events and broadcast to WebSocket clients."""
        while self._running:
            try:
                # Check for new events (simplified - in production use a queue)
                await asyncio.sleep(0.01)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Event consumer error: {e}")
                await asyncio.sleep(1)

    async def _on_event(self, event: Dict[str, Any]) -> None:
        """Handle an event from the bus."""
        event_type = event.get("type", "unknown")
        data = event.get("data", {})
        analysis_id = data.get("analysis_id", "")

        if not analysis_id:
            return

        # Convert to frontend format
        frontend_event = self._to_frontend_event(event_type, data)

        # Broadcast
        await connection_manager.broadcast_to_analysis(analysis_id, frontend_event)

    def _to_frontend_event(self, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert internal event to frontend-friendly format."""
        frontend_type = event_type.replace(".", "_")
        
        event = {
            "type": frontend_type,
            "timestamp": data.get("timestamp", ""),
            "data": data,
        }

        # Provide progress percentage
        if "progress" in data:
            event["progress"] = data["progress"]
        
        # Provide agent name for agent events
        if "agent_name" in data:
            event["agent"] = {
                "name": data["agent_name"],
                "status": data.get("status", "running"),
                "progress": data.get("progress", 0),
                "total_agents": data.get("total_agents", 1),
                "agent_order": data.get("agent_order", 0),
            }

        return event


# Global singleton
event_consumer = EventConsumerService()


# FastAPI WebSocket endpoints
async def websocket_analysis(websocket: WebSocket, analysis_id: str):
    """WebSocket endpoint for analysis progress."""
    await connection_manager.connect_to_analysis(websocket, analysis_id)
    try:
        while True:
            # Keep connection alive, handle client messages
            data = await websocket.receive_text()
            msg = json.loads(data)
            
            if msg.get("type") == "ping":
                await connection_manager._send_json(websocket, {
                    "type": "pong",
                    "timestamp": None,
                })
    except WebSocketDisconnect:
        await connection_manager.disconnect(websocket, analysis_id)
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        await connection_manager.disconnect(websocket, analysis_id)


async def websocket_admin(websocket: WebSocket):
    """WebSocket endpoint for all events (admin)."""
    await connection_manager.connect_admin(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            
            if msg.get("type") == "ping":
                await connection_manager._send_json(websocket, {
                    "type": "pong",
                    "timestamp": None,
                })
    except WebSocketDisconnect:
        await connection_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"Admin WebSocket error: {e}")
        await connection_manager.disconnect(websocket)