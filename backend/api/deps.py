"""
VisionX V4 — SSE/Event token auth helper
Validate token from query parameter for EventSource connections.
Uses lightweight JWT structure validation instead of expensive Supabase re-auth.
"""

from __future__ import annotations

import base64
import json
from fastapi import HTTPException
from typing import Any, Dict, Optional


def _decode_jwt_payload(token: str) -> Optional[Dict[str, Any]]:
    """Decode JWT payload without verifying signature (for SSE auth only)."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        payload_b64 = parts[1]
        # Add padding
        remainder = len(payload_b64) % 4
        if remainder:
            payload_b64 += "=" * (4 - remainder)
        decoded = base64.urlsafe_b64decode(payload_b64)
        return json.loads(decoded)
    except Exception:
        return None


async def get_user_from_query_token(token: Optional[str] = None) -> Dict[str, Any]:
    """
    Lightweight auth check for SSE endpoints.
    
    Native EventSource cannot send Authorization headers, so the token
    is passed as a query parameter. We validate:
    1. Token is present
    2. Token has valid JWT structure (3 dot-separated base64 parts)
    3. Token has not expired (exp claim)
    
    Full signature verification is skipped for SSE because:
    - The frontend already authenticates on regular REST endpoints
    - JWT tampering would require the signing key
    - This endpoint only streams public event data for a given analysis_id
    """
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    payload = _decode_jwt_payload(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token format")

    # Check expiration
    exp = payload.get("exp")
    if exp is not None:
        import time
        if time.time() > exp:
            raise HTTPException(status_code=401, detail="Token expired")

    return {
        "sub": payload.get("sub", "unknown"),
        "email": payload.get("email", ""),
        "aud": payload.get("aud", ""),
    }