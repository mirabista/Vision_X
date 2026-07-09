"""
VisionX API Middleware
Request/response middleware for correlation IDs, CORS, rate limiting, and error handling.
"""

from __future__ import annotations

import time
from typing import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from backend.core.logging import get_logger, set_correlation_id, get_correlation_id
from backend.core.exceptions import VisionXError
from backend.events.event_bus import EventType, event_bus

logger = get_logger(__name__)


class CorrelationIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware that assigns a correlation ID to every request.
    Uses existing X-Correlation-ID header or generates a new one.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Extract or generate correlation ID
        cid = request.headers.get("X-Correlation-ID")
        cid = set_correlation_id(cid)

        # Process request
        start_time = time.monotonic()
        response = await call_next(request)
        duration = (time.monotonic() - start_time) * 1000

        # Add correlation ID to response headers
        response.headers["X-Correlation-ID"] = cid
        response.headers["X-Request-Duration-Ms"] = str(int(duration))

        return response


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that catches VisionXError and returns structured JSON responses.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            response = await call_next(request)
            return response
        except VisionXError as e:
            logger.warning(
                f"VisionX error: {e.code} - {e.message}",
                extra_fields={"status_code": e.status_code, "error_code": e.code},
            )
            return JSONResponse(
                status_code=e.status_code,
                content=e.to_dict(),
            )
        except Exception as e:
            logger.error(f"Unhandled error: {e}", exc_info=True)
            # Publish system error event (non-blocking)
            try:
                await event_bus.publish(
                    Event(
                        type=EventType.SYSTEM_ERROR,
                        analysis_id="system",
                        data={"error": str(e), "path": str(request.url)},
                    )
                )
            except Exception:
                pass
            
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": {
                        "code": "internal_error",
                        "message": "An unexpected error occurred",
                    },
                },
            )


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs all requests with method, path, status, and duration.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        cid = get_correlation_id() or "no-cid"
        logger.info(
            f"→ {request.method} {request.url.path}",
            extra_fields={
                "correlation_id": cid,
                "method": request.method,
                "path": request.url.path,
                "query": str(request.url.query),
            },
        )

        start = time.monotonic()
        response = await call_next(request)
        duration = (time.monotonic() - start) * 1000

        logger.info(
            f"← {request.method} {request.url.path} {response.status_code} ({duration:.0f}ms)",
            extra_fields={
                "correlation_id": cid,
                "status_code": response.status_code,
                "duration_ms": int(duration),
            },
        )

        return response