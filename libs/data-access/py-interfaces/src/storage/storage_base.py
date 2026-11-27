"""Abstract base class for concrete ``StorageProvider`` adapter implementations."""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Mapping
from typing import Literal

from ..common import DataAccessError, PaginatedResult, Result
from .storage_interface import SignedUrlResponse, StorageObjectMeta


class BaseStorageProvider(ABC):
    """Abstract base class for concrete ``StorageProvider`` adapter implementations."""

    @abstractmethod
    async def upload(
        self,
        key: str,
        data: bytes,
        *,
        content_type: str = "application/octet-stream",
        metadata: Mapping[str, str] | None = None,
    ) -> Result[StorageObjectMeta, DataAccessError]:
        """Upload raw bytes to ``key`` and return the resulting object metadata."""

    @abstractmethod
    async def download(self, key: str) -> Result[bytes, DataAccessError]:
        """Download object bytes for ``key``, returning ``Err(NOT_FOUND)`` if absent."""

    @abstractmethod
    async def get_signed_url(
        self,
        key: str,
        *,
        expires_in_seconds: int = 3600,
        method: Literal["GET", "PUT", "DELETE"] = "GET",
    ) -> Result[SignedUrlResponse, DataAccessError]:
        """Generate a time-limited pre-signed URL for ``key``."""

    @abstractmethod
    async def delete(self, key: str) -> Result[None, DataAccessError]:
        """Delete the object at ``key``, returning ``Err(NOT_FOUND)`` if missing."""

    @abstractmethod
    async def list_objects(
        self,
        *,
        prefix: str = "",
        limit: int = 100,
        cursor: str | None = None,
    ) -> Result[PaginatedResult[StorageObjectMeta], DataAccessError]:
        """List object metadata matching ``prefix`` with pagination."""
