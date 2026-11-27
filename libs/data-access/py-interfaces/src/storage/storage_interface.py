"""Vendor-agnostic object/blob storage DTOs and Protocol."""

from __future__ import annotations

from collections.abc import Mapping
from datetime import datetime
from typing import Literal, Protocol, runtime_checkable

from pydantic import BaseModel, ConfigDict, Field

from ..common import DataAccessError, PaginatedResult, Result


class StorageObjectMeta(BaseModel):
    """Immutable metadata describing a stored blob/object."""

    model_config = ConfigDict(frozen=True)

    key: str = Field(..., min_length=1, description="Object key or path within the bucket.")
    bucket: str | None = Field(default=None, description="Storage bucket or container name.")
    content_type: str = Field(
        default="application/octet-stream",
        min_length=1,
        description="MIME media type of the stored object.",
    )
    size_bytes: int = Field(..., ge=0, description="Object byte length.")
    etag: str | None = Field(default=None, description="Content hash / entity tag.")
    created_at: datetime | None = Field(
        default=None,
        description="Creation UTC timestamp.",
    )
    updated_at: datetime | None = Field(
        default=None,
        description="Last modification UTC timestamp.",
    )
    metadata: dict[str, str] = Field(
        default_factory=dict,
        description="Custom user-defined string metadata.",
    )


class SignedUrlResponse(BaseModel):
    """Time-limited pre-signed URL response for direct object access."""

    model_config = ConfigDict(frozen=True)

    url: str = Field(..., min_length=1, description="Pre-signed HTTP(S) URL.")
    expires_at: datetime = Field(..., description="UTC timestamp when the signed URL expires.")
    method: Literal["GET", "PUT", "DELETE"] = Field(
        default="GET",
        description="HTTP method authorized by this signed URL.",
    )
    headers: dict[str, str] = Field(
        default_factory=dict,
        description="Required HTTP headers that the client must send with the signed request.",
    )


@runtime_checkable
class StorageProvider(Protocol):
    """Structural capability contract for object/blob storage providers."""

    async def upload(
        self,
        key: str,
        data: bytes,
        *,
        content_type: str = "application/octet-stream",
        metadata: Mapping[str, str] | None = None,
    ) -> Result[StorageObjectMeta, DataAccessError]:
        """Upload raw bytes to ``key`` and return the resulting object metadata."""
        ...

    async def download(self, key: str) -> Result[bytes, DataAccessError]:
        """Download object bytes for ``key``, returning ``Err(NOT_FOUND)`` if absent."""
        ...

    async def get_signed_url(
        self,
        key: str,
        *,
        expires_in_seconds: int = 3600,
        method: Literal["GET", "PUT", "DELETE"] = "GET",
    ) -> Result[SignedUrlResponse, DataAccessError]:
        """Generate a time-limited pre-signed URL for ``key``."""
        ...

    async def delete(self, key: str) -> Result[None, DataAccessError]:
        """Delete the object at ``key``, returning ``Err(NOT_FOUND)`` if missing."""
        ...

    async def list_objects(
        self,
        *,
        prefix: str = "",
        limit: int = 100,
        cursor: str | None = None,
    ) -> Result[PaginatedResult[StorageObjectMeta], DataAccessError]:
        """List object metadata matching ``prefix`` with pagination."""
        ...
