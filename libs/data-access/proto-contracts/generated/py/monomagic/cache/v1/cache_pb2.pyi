from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class CacheEntry(_message.Message):
    __slots__ = ("key", "value", "ttl_seconds", "created_at")
    KEY_FIELD_NUMBER: _ClassVar[int]
    VALUE_FIELD_NUMBER: _ClassVar[int]
    TTL_SECONDS_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    key: str
    value: str
    ttl_seconds: int
    created_at: str
    def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ..., ttl_seconds: _Optional[int] = ..., created_at: _Optional[str] = ...) -> None: ...

class LockLease(_message.Message):
    __slots__ = ("resource_key", "token", "ttl_ms", "acquired_at")
    RESOURCE_KEY_FIELD_NUMBER: _ClassVar[int]
    TOKEN_FIELD_NUMBER: _ClassVar[int]
    TTL_MS_FIELD_NUMBER: _ClassVar[int]
    ACQUIRED_AT_FIELD_NUMBER: _ClassVar[int]
    resource_key: str
    token: str
    ttl_ms: int
    acquired_at: str
    def __init__(self, resource_key: _Optional[str] = ..., token: _Optional[str] = ..., ttl_ms: _Optional[int] = ..., acquired_at: _Optional[str] = ...) -> None: ...

class CacheStats(_message.Message):
    __slots__ = ("hits", "misses", "key_count")
    HITS_FIELD_NUMBER: _ClassVar[int]
    MISSES_FIELD_NUMBER: _ClassVar[int]
    KEY_COUNT_FIELD_NUMBER: _ClassVar[int]
    hits: int
    misses: int
    key_count: int
    def __init__(self, hits: _Optional[int] = ..., misses: _Optional[int] = ..., key_count: _Optional[int] = ...) -> None: ...
