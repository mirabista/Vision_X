"""
VisionX Security Module
JWT authentication, password hashing, and authorization utilities.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from backend.core.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def create_access_token(
    subject: str,
    extra_claims: Optional[Dict[str, Any]] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a JWT access token.

    Args:
        subject: User ID or identifier (sub claim)
        extra_claims: Additional claims to include in the token
        expires_delta: Token expiration time

    Returns:
        Encoded JWT string
    """
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES))

    to_encode: Dict[str, Any] = {
        "sub": subject,
        "iss": settings.JWT_ISSUER,
        "iat": now,
        "exp": expire,
        "jti": str(uuid.uuid4()),
        "type": "access",
    }

    if extra_claims:
        to_encode.update(extra_claims)

    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(
    subject: str,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Create a JWT refresh token with longer expiration.

    Args:
        subject: User ID or identifier
        extra_claims: Additional claims

    Returns:
        Encoded JWT string
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode: Dict[str, Any] = {
        "sub": subject,
        "iss": settings.JWT_ISSUER,
        "iat": now,
        "exp": expire,
        "jti": str(uuid.uuid4()),
        "type": "refresh",
    }

    if extra_claims:
        to_encode.update(extra_claims)

    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and verify a JWT token.

    Args:
        token: The JWT token string

    Returns:
        Decoded payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
        )
        return payload
    except JWTError:
        return None


def extract_user_id(token: str) -> Optional[str]:
    """
    Extract user ID from a JWT token.

    Args:
        token: The JWT token string

    Returns:
        User ID if token is valid, None otherwise
    """
    payload = decode_token(token)
    if payload is None:
        return None
    return payload.get("sub")


def is_token_expired(token: str) -> bool:
    """
    Check if a JWT token is expired.

    Args:
        token: The JWT token string

    Returns:
        True if expired, False otherwise
    """
    payload = decode_token(token)
    if payload is None:
        return True
    exp = payload.get("exp")
    if exp is None:
        return True
    return datetime.now(timezone.utc).timestamp() > exp


def generate_api_key() -> str:
    """Generate a secure API key for service-to-service communication."""
    return f"vx_{uuid.uuid4().hex}"