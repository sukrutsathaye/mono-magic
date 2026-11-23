"""Unit tests for py_utils_common.settings."""

from __future__ import annotations

import pytest
from py_utils_common import BaseAppSettings
from pydantic import ValidationError


def test_base_app_settings_defaults() -> None:
    settings = BaseAppSettings()
    assert settings.app_name == "mono-magic-service"
    assert settings.environment == "development"
    assert settings.log_level == "INFO"
    assert settings.debug is False
    assert settings.is_production is False


def test_base_app_settings_reads_env_and_ignores_extra(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("APP_NAME", "reflective-api")
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("LOG_LEVEL", "WARNING")
    monkeypatch.setenv("DEBUG", "true")
    monkeypatch.setenv("UNRELATED_EXTRA_VAR", "ignored")

    settings = BaseAppSettings()
    assert settings.app_name == "reflective-api"
    assert settings.environment == "production"
    assert settings.log_level == "WARNING"
    assert settings.debug is True
    assert settings.is_production is True


def test_base_app_settings_is_frozen_and_validates() -> None:
    settings = BaseAppSettings(environment="staging", log_level="DEBUG")
    assert settings.is_production is False

    with pytest.raises(ValidationError):
        settings.debug = True  # type: ignore[misc]

    with pytest.raises(ValidationError):
        BaseAppSettings(app_name="")

    with pytest.raises(ValidationError):
        BaseAppSettings(environment="invalid")  # type: ignore[arg-type]
