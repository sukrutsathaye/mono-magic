"""Pydantic v2 immutable base settings for Python services and libraries."""

from __future__ import annotations

from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["development", "staging", "production", "test"]
LogLevel = Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]


class BaseAppSettings(BaseSettings):
    """Immutable base configuration loaded from environment variables or kwargs.

    Attributes:
        app_name: Identifier for the application or service.
        environment: Deployment environment name.
        log_level: Minimum structured log severity level.
        debug: Flag enabling verbose debug behavior in non-production environments.
    """

    model_config = SettingsConfigDict(
        frozen=True,
        extra="ignore",
        env_file_encoding="utf-8",
    )

    app_name: str = Field(default="mono-magic-service", min_length=1)
    environment: Environment = "development"
    log_level: LogLevel = "INFO"
    debug: bool = False

    @property
    def is_production(self) -> bool:
        """Return ``True`` when running in the ``production`` environment."""
        return self.environment == "production"
