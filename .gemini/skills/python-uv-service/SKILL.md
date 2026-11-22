---
name: python-uv-service
description: >-
  Standards and runbook for developing Python >=3.12 libraries (libs/*/py-*) and FastAPI
  microservices (apps/api-*) inside mono-magic's uv workspace, covering pyproject.toml,
  Nx targets (ruff, pyright, pytest --cov), FastAPI lifespan singletons, Pydantic v2,
  and SOLID Protocol architecture. Use when creating or updating any Python package or API.
---

# Python `uv` Service & Library Runbook

Use this skill whenever creating, updating, or testing any Python library (`libs/*/py-*`) or FastAPI service (`apps/api-*`) in `mono-magic`. Ensure you also follow [engineering-standards](../engineering-standards/SKILL.md).

---

## 1. `uv` Workspace Layout & `pyproject.toml`

Root [pyproject.toml](../../../pyproject.toml) registers all Python workspace members using the 4-domain `libs/` structure:

```toml
[project]
name = "mono-repo-magic-python"
version = "0.0.0"
requires-python = ">=3.12"

[tool.uv.workspace]
members = ["apps/api-*", "libs/*/py-*"]
```

### Package Naming & Workspace Linking
- **Utilities**: `libs/utils/py-<name>` (package name `py-utils-<name>`, import `py_utils_<name>`, tags: `scope:utils`, `type:util`, `lang:py`).
- **Data-Access Contracts**: `libs/data-access/py-interfaces` (package name `py-data-access-interfaces`, import `py_data_access_interfaces`, tags: `scope:data-access`, `type:interfaces`, `lang:py`).
- **Data-Access Providers**: `libs/data-access/py-<provider>` (e.g., `py-reflective-nlp`, tags: `scope:data-access`, `type:data-access`, `lang:py`).
- **FastAPI Microservices**: `apps/api-<service>` (tags: `scope:app`, `type:app`, `lang:py`).

Inside any downstream `pyproject.toml`, link sibling workspace packages via `[tool.uv.sources]`:

```toml
[project]
name = "api-reflective-learning"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
  "fastapi>=0.115.0",
  "uvicorn[standard]>=0.32.0",
  "pydantic>=2.10.0",
  "pydantic-settings>=2.6.0",
  "py-data-access-interfaces",
]

[tool.uv.sources]
py-data-access-interfaces = { workspace = true }
```

Use `hatchling` (with `src/<package_snake_case>/`) and PEP 561 `py.typed` markers so `pyright` resolves cross-package types cleanly.

---

## 2. Standard Nx `project.json` Targets

Every Python library and FastAPI service MUST expose uniform Nx targets (`lint`, `typecheck`, `test`):

```json
{
  "name": "py-data-access-interfaces",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "projectType": "library",
  "sourceRoot": "libs/data-access/py-interfaces/src",
  "tags": ["scope:data-access", "type:interfaces", "lang:py"],
  "targets": {
    "lint": {
      "command": "uv run ruff check libs/data-access/py-interfaces && uv run ruff format --check libs/data-access/py-interfaces"
    },
    "typecheck": {
      "command": "uv run pyright libs/data-access/py-interfaces"
    },
    "test": {
      "command": "uv run pytest libs/data-access/py-interfaces/tests --cov=libs/data-access/py-interfaces/src --cov-report=term-missing --cov-fail-under=80"
    }
  }
}
```

- **Coverage Thresholds**:
  - Set `--cov-fail-under=90` for pure utility libraries under `libs/utils/py-*`.
  - Set `--cov-fail-under=80` for `libs/data-access/py-*`, `libs/features/py-*`, and `apps/api-*`.
- **Execution via Nx**:
  ```bash
  uv sync
  pnpm nx run-many -t lint typecheck test -p <python-project-name>
  ```

---

## 3. FastAPI `lifespan` Singletons & Async Performance

Never instantiate ML/NLP models, `httpx.AsyncClient`, or database engines inside module globals or per-request handlers. Wire all shared resources in FastAPI `lifespan` using a `@dataclass(slots=True)` state container and inject via `Depends`:

```python
from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass
import httpx
from fastapi import Depends, FastAPI, Request


@dataclass(slots=True)
class AppState:
    """Application-scoped singleton dependencies managed by FastAPI lifespan."""

    http_client: httpx.AsyncClient


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    http_client = httpx.AsyncClient(timeout=15.0)
    app.state.services = AppState(http_client=http_client)
    try:
        yield
    finally:
        await http_client.aclose()


def get_services(request: Request) -> AppState:
    return request.app.state.services
```

- Offload CPU-bound work (local ONNX embeddings, `spaCy` `nlp.pipe`, PDF/EPUB parsing) with `await asyncio.to_thread(...)` so the event loop never blocks.
- Keep `apps/api-*` as a **thin shell** (routes, request validation, `lifespan` wiring, health checks) delegating domain logic to `libs/data-access/py-*` and `libs/utils/py-*`.

---

## 4. Pydantic v2 & SOLID `Protocol` Patterns

- **Pydantic v2 DTOs**:
  - Use `enum.StrEnum` for status/error enums, `Field(...)` constraints (`min_length`, `ge`, `le`), `ConfigDict(frozen=True)` for immutable DTOs, and `model_validate_json()` for structured outputs.
- **SOLID Protocols (`typing.Protocol` / `abc.ABC`)**:
  - Define abstract capabilities in `libs/data-access/py-interfaces` using `typing.Protocol` (structural typing) and `abc.ABC` helpers, returning typed `Result` / `DataAccessError` objects instead of raising vendor-specific exceptions.
  - Pair every protocol with reusable `pytest` contract assertions (`assert_repository_contract`, `assert_auth_contract`) so concrete implementations verify Liskov Substitution.
- **Docstrings**: Document all public modules, classes, protocols, and methods with Google-style docstrings.

---

## 5. ASGI End-to-End Testing (`apps/api-*`)

Every FastAPI service in `apps/api-*` MUST include ASGI E2E tests exercising real routing, serialization, error codes, and `lifespan` startup/shutdown without spawning an external socket server:

```python
import httpx
import pytest


@pytest.mark.asyncio
async def test_health_endpoint() -> None:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
```
