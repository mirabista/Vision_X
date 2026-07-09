"""
Supabase Database Client
Provides Supabase client for database and auth operations.
"""

from __future__ import annotations

import os
from typing import Optional

from supabase import create_client, Client


# Module-level client instance
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """
    Get or create Supabase client with service role key for backend operations.
    
    Returns:
        Supabase Client instance
    
    Raises:
        RuntimeError: If SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are not configured
    """
    global _supabase_client
    
    if _supabase_client is None:
        supabase_url = os.getenv("SUPABASE_URL")
        # Use service role key for backend operations
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")
        
        if not supabase_url:
            raise RuntimeError("Supabase not configured. Set SUPABASE_URL environment variable.")
        
        if not supabase_key:
            raise RuntimeError("Supabase not configured. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY environment variable.")
        
        _supabase_client = create_client(supabase_url, supabase_key)
    
    return _supabase_client


def reset_client():
    """Reset the client instance (useful for testing)."""
    global _supabase_client
    _supabase_client = None