"""
VisionX V4 — SSE/Event token auth helper
Validate token from query parameter for EventSource connections.
Uses lightweight JWT structure validation instead of expensive Supabase re-auth.
"""

from __future__ import annotations

from fastapi import HTTPException
from typing import Any, Dict, Optional

from backend.api.dependencies import verify_supabase_token


async def get_user_from_query_token(token: Optional[str] = None) -> Dict[str, Any]:
    """
    Auth check for SSE endpoints.
    
    Native EventSource cannot send Authorization headers, so the token
    is passed as a query parameter. We validate:
    1. Token is present
    2. Token has valid JWT structure (3 dot-separated base64 parts)
    3. Token has not expired (exp claim)
    
    Native EventSource cannot send Authorization headers, so the token
    is passed as a query parameter and verified with Supabase.
    """
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        return verify_supabase_token(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc
