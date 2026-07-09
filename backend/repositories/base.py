"""
Base Repository Interface
Abstract base class for all repositories.
"""

from __future__ import annotations

from typing import Generic, TypeVar, List, Optional, Dict, Any
from abc import ABC, abstractmethod

T = TypeVar('T')


class Repository(ABC, Generic[T]):
    """
    Base repository interface.
    
    All repositories must inherit from this class.
    """
    
    @abstractmethod
    async def create(self, data: Dict[str, Any]) -> str:
        ...
    
    @abstractmethod
    async def get(self, id: str) -> Optional[T]:
        ...
    
    @abstractmethod
    async def list(self, *args, **kwargs) -> List[T]:
        ...
    
    @abstractmethod
    async def update(self, id: str, data: Dict[str, Any]) -> T:
        ...
    
    @abstractmethod
    async def delete(self, id: str) -> None:
        ...
