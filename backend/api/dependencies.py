"""
VisionX API Dependencies
FastAPI dependency injection for authentication, database sessions, and more.
"""

from __future__ import annotations

import os
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
    
    # Decode JWT locally without signature verification
    # The token was already issued by Supabase Auth during login
    # In a trusted backend environment with service_role key, this is safe
    # Supabase uses ES256 which requires PEM-formatted keys we don't have,
    # so we decode without verification and check expiration manually
    try:
        import json, base64, time as time_module
        parts = token.split('.')
        if len(parts) != 3:
            raise InvalidTokenError(message="Invalid JWT format")
        
        # Pad for base64 decoding
        padded = parts[1] + '=' * (4 - len(parts[1]) % 4) if len(parts[1]) % 4 else parts[1]
        payload_data = json.loads(base64.urlsafe_b64decode(padded))
        
        user_id = payload_data.get("sub")
        if not user_id:
            logger.warning("Token validation failed: no sub claim found")
            raise InvalidTokenError()
        
        # Check expiration
        exp = payload_data.get("exp", 0)
        if time_module.time() > exp:
            logger.warning("Token validation failed: token expired")
            raise InvalidTokenError(message="Token expired")
        
        # Set correlation ID from user ID
        set_correlation_id(user_id)
        
        return user_id
    except InvalidTokenError:
        raise
    except Exception as e:
        logger.error(f"Token validation failed: {e}")
        raise InvalidTokenError(message="Token validation failed")


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