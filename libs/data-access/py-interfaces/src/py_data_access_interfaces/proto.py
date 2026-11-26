"""Re-exports generated Protobuf wire modules from `libs/data-access/proto-contracts`.

Regenerate via: `pnpm nx run proto-contracts:generate`.
"""

from __future__ import annotations

import sys
from pathlib import Path

_GEN_ROOT = str(Path(__file__).resolve().parent / "gen")
if _GEN_ROOT not in sys.path:
    sys.path.insert(0, _GEN_ROOT)

from monomagic.ai.v1 import ai_pb2  # noqa: E402
from monomagic.auth.v1 import auth_pb2  # noqa: E402
from monomagic.cache.v1 import cache_pb2  # noqa: E402
from monomagic.common.v1 import errors_pb2, pagination_pb2  # noqa: E402
from monomagic.payments.v1 import payments_pb2  # noqa: E402
from monomagic.realtime.v1 import realtime_pb2  # noqa: E402
from monomagic.reflective.v1 import reflective_pb2  # noqa: E402
from monomagic.storage.v1 import storage_pb2  # noqa: E402

__all__ = [
    "ai_pb2",
    "auth_pb2",
    "cache_pb2",
    "errors_pb2",
    "pagination_pb2",
    "payments_pb2",
    "realtime_pb2",
    "reflective_pb2",
    "storage_pb2",
]
