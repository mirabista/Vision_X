"""
VisionX API Dependencies
FastAPI dependency injection for authentication, database sessions, and more.
"""

from __future__ import annotations

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.exceptions import AuthenticationError, InvalidTokenError
from backend.database.session import get_session
from backend.database.supabase_client import get_supabase_client
from backend.core.logging import set_correlation_id, get_logger

logger = get_logger(__name__)

# Bearer token scheme
bearer_scheme = HTTPBearer(auto_error=False)


def verify_supabase_token(token: str) -> dict:
    """Verify a Supabase access token and return the authenticated user data."""
    try:
        result = get_supabase_client().auth.get_user(token)
    except Exception as exc:
        logger.warning("Supabase token verification failed: %s", exc)
        raise InvalidTokenError(message="Invalid or expired token") from exc

    user = getattr(result, "user", None)
    if user is None:
        raise InvalidTokenError(message="Invalid or expired token")

    user_id = getattr(user, "id", None)
    if not user_id:
        raise InvalidTokenError(message="Invalid token")

    return {
        "sub": user_id,
        "email": getattr(user, "email", "") or "",
        "user": user,
    }


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> str:
    """
    FastAPI dependency that extracts and validates the current user from Supabase JWT.
    
    Returns:
        User ID string
        
    Raises:
        HTTPException 401 if authentication fails
    """
    if credentials is None:
        raise AuthenticationError(message="Authentication required")

    token = credentials.credentials
    payload = verify_supabase_token(token)
    user_id = payload["sub"]
    set_correlation_id(user_id)
    return user_id


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Optional[str]:
    """
    FastAPI dependency that optionally extracts the current user.
    Returns None if no valid token is provided.
    """
    if credentials is None:
        return None
    
    try:
        return await get_current_user(credentials)
    except Exception:
        return None


async def get_db_session() -> AsyncSession:
    """
    FastAPI dependency that yields an async database session.
    """
    async for session in get_session():
        yield session
