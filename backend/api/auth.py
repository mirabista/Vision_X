"""
Authentication Routes - REST endpoints for authentication.
Integrates with Supabase Auth for seamless frontend integration.
"""

from __future__ import annotations

import logging
from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from backend.core.logging import get_logger
from backend.core.exceptions import ValidationError, AuthenticationError
from backend.api.dependencies import verify_supabase_token

logger = get_logger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])


# Request/Response Models
class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ResetPasswordRequest(BaseModel):
    email: str


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None


class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None
    session: Optional[dict] = None
    profile: Optional[dict] = None


def get_supabase_client():
    """Get Supabase client (lazy import to avoid circular dependencies)."""
    try:
        from backend.database.supabase_client import get_supabase_client as _get_client
        return _get_client()
    except Exception as e:
        logger.error(f"Failed to get Supabase client: {e}")
        raise HTTPException(status_code=500, detail="Authentication service unavailable")


@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    """Register a new user with Supabase Auth."""
    try:
        supabase = get_supabase_client()
        
        # Register user with Supabase Auth
        result = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.full_name,
                }
            }
        })
        
        if result.user is None:
            raise ValidationError(message="Registration failed")
        
        # Create user profile in database using direct Supabase call
        try:
            supabase.schema("public").table("profiles").upsert({
                "id": result.user.id,
                "email": request.email,
                "full_name": request.full_name,
                "role": "user",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }).execute()
            logger.info(f"[Register] Profile created for user {result.user.id}")
        except Exception as e:
            logger.warning(f"[Register] Profile creation failed: {e}")
        
        return AuthResponse(
            success=True,
            message="Registration successful. Please check your email to confirm.",
            user={
                "id": result.user.id,
                "email": result.user.email,
                "full_name": request.full_name,
            },
            session={
                "access_token": result.session.access_token if result.session else None,
                "refresh_token": result.session.refresh_token if result.session else None,
                "expires_at": result.session.expires_at if result.session else None,
            } if result.session else None,
        )
    
    except ValidationError:
        raise
    except Exception as e:
        logger.error(f"Registration failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """Login user with Supabase Auth."""
    try:
        supabase = get_supabase_client()
        
        # Login with Supabase Auth
        result = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })
        
        if result.user is None or result.session is None:
            raise AuthenticationError(message="Invalid email or password")
        
        # Get user profile
        profile_data = None
        try:
            from backend.database.session import get_session
            from backend.models.user import UserProfile
            
            async for session in get_session():
                from sqlalchemy import select
                stmt = select(UserProfile).where(UserProfile.id == result.user.id)
                profile = (await session.execute(stmt)).scalar_one_or_none()
                if profile:
                    profile_data = {
                        "id": profile.id,
                        "email": profile.email,
                        "full_name": profile.full_name,
                        "username": profile.username,
                        "avatar_url": profile.avatar_url,
                        "bio": profile.bio,
                    }
        except Exception as e:
            logger.warning(f"Profile fetch failed (non-critical): {e}")
        
        return AuthResponse(
            success=True,
            message="Login successful",
            user={
                "id": result.user.id,
                "email": result.user.email,
                "full_name": profile_data.get("full_name") if profile_data else None,
            },
            session={
                "access_token": result.session.access_token,
                "refresh_token": result.session.refresh_token,
                "expires_at": result.session.expires_at,
            },
            profile=profile_data,
        )
    
    except AuthenticationError:
        raise
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid email or password")


@router.post("/logout", response_model=AuthResponse)
async def logout(request: Request):
    """Logout user by invalidating Supabase session."""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get("authorization", "")
        token = None
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
        
        if token:
            try:
                supabase = get_supabase_client()
                supabase.auth.sign_out()
            except Exception as e:
                logger.warning(f"Supabase logout failed (non-critical): {e}")
        
        return AuthResponse(
            success=True,
            message="Logout successful",
        )
    
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        return AuthResponse(
            success=True,
            message="Logout successful",
        )


@router.get("/me", response_model=AuthResponse)
async def get_current_user_info(request: Request):
    """Get current user information from Supabase token."""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get("authorization", "")
        if not auth_header.startswith("Bearer "):
            raise AuthenticationError(message="Authentication required")
        
        token = auth_header[7:]
        
        # Verify token with Supabase - use anon key client for user token verification
        import os
        from supabase import create_client
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
        
        if supabase_url and supabase_anon_key:
            anon_client = create_client(supabase_url, supabase_anon_key)
            result = anon_client.auth.get_user(token)
        else:
            # Fallback: use service role client
            supabase = get_supabase_client()
            result = supabase.auth.get_user(token)
        
        if result.user is None:
            raise AuthenticationError(message="Invalid or expired token")
        
        # Get user profile from Supabase profiles table
        profile_data = None
        try:
            supabase = get_supabase_client()
            profile_result = supabase.schema("public").table("profiles").select("*").eq("id", result.user.id).execute()
            if profile_result.data:
                p = profile_result.data[0]
                profile_data = {
                    "id": p.get("id"),
                    "email": p.get("email"),
                    "full_name": p.get("full_name"),
                    "username": p.get("username"),
                    "avatar_url": p.get("avatar_url"),
                    "bio": p.get("bio"),
                    "created_at": p.get("created_at"),
                }
        except Exception as e:
            logger.warning(f"Profile fetch failed (non-critical): {e}")
        
        return AuthResponse(
            success=True,
            message="User info retrieved",
            user={
                "id": result.user.id,
                "email": result.user.email,
                "full_name": profile_data.get("full_name") if profile_data else None,
            },
            profile=profile_data,
        )
    
    except AuthenticationError:
        raise
    except Exception as e:
        logger.error(f"Get current user failed: {e}")
        raise HTTPException(status_code=401, detail="Failed to get user information")


@router.put("/profile", response_model=AuthResponse)
async def update_profile(request: Request, data: UpdateProfileRequest):
    """Update user profile."""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get("authorization", "")
        if not auth_header.startswith("Bearer "):
            raise AuthenticationError(message="Authentication required")
        
        token = auth_header[7:]
        
        payload = verify_supabase_token(token)
        user_id = payload["sub"]
        user_email = payload.get("email", "")
        
        # Update profile in Supabase profiles table
        supabase = get_supabase_client()
        
        # Build update data - only include columns that exist in the profiles table
        update_data = {}
        if data.full_name is not None:
            update_data["full_name"] = data.full_name
        if data.avatar_url is not None:
            update_data["avatar_url"] = data.avatar_url
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        # Upsert profile
        profile_result = supabase.schema("public").table("profiles").upsert({
            "id": user_id,
            "email": user_email or "",
            **update_data
        }).execute()
        
        if profile_result.data:
            p = profile_result.data[0]
            profile_data = {
                "id": p.get("id"),
                "email": p.get("email"),
                "full_name": p.get("full_name"),
                "username": p.get("username"),
                "avatar_url": p.get("avatar_url"),
                "bio": p.get("bio"),
            }
        else:
            profile_data = {
                "id": user_id,
                "email": user_email or "",
                "full_name": data.full_name,
                "username": data.username,
                "avatar_url": data.avatar_url,
                "bio": data.bio,
            }
        
        return AuthResponse(
            success=True,
            message="Profile updated successfully",
            profile=profile_data,
        )
    
    except AuthenticationError:
        raise
    except Exception as e:
        logger.error(f"Profile update failed: {e}")
        raise HTTPException(status_code=400, detail="Failed to update profile")


@router.post("/reset-password", response_model=AuthResponse)
async def reset_password(request: ResetPasswordRequest):
    """Request password reset email."""
    try:
        supabase = get_supabase_client()
        
        # Send password reset email via Supabase
        supabase.auth.reset_password_for_email(request.email)
        
        return AuthResponse(
            success=True,
            message="Password reset email sent. Please check your inbox.",
        )
    
    except Exception as e:
        logger.error(f"Password reset failed: {e}")
        return AuthResponse(
            success=True,
            message="If the email exists, a password reset link has been sent.",
        )


@router.post("/refresh-token")
async def refresh_token(request: Request):
    """Refresh access token using refresh token."""
    try:
        # Get refresh token from request body
        body = await request.json()
        refresh_token = body.get("refresh_token")
        
        if not refresh_token:
            raise ValidationError(message="Refresh token required")
        
        supabase = get_supabase_client()
        
        # Refresh session
        result = supabase.auth.refresh_session(refresh_token)
        
        if result.session is None:
            raise AuthenticationError(message="Invalid refresh token")
        
        return {
            "success": True,
            "session": {
                "access_token": result.session.access_token,
                "refresh_token": result.session.refresh_token,
                "expires_at": result.session.expires_at,
            },
        }
    
    except (AuthenticationError, ValidationError):
        raise
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        raise HTTPException(status_code=401, detail="Failed to refresh token")
