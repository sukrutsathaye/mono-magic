import datetime

from google.protobuf import struct_pb2 as _struct_pb2
from google.protobuf import timestamp_pb2 as _timestamp_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class RealtimeEnvelope(_message.Message):
    __slots__ = ("id", "channel", "event", "payload", "sender_id", "timestamp", "metadata")
    class MetadataEntry(_message.Message):
        __slots__ = ("key", "value")
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    ID_FIELD_NUMBER: _ClassVar[int]
    CHANNEL_FIELD_NUMBER: _ClassVar[int]
    EVENT_FIELD_NUMBER: _ClassVar[int]
    PAYLOAD_FIELD_NUMBER: _ClassVar[int]
    SENDER_ID_FIELD_NUMBER: _ClassVar[int]
    TIMESTAMP_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    id: str
    channel: str
    event: str
    payload: _struct_pb2.Value
    sender_id: str
    timestamp: _timestamp_pb2.Timestamp
    metadata: _containers.ScalarMap[str, str]
    def __init__(self, id: _Optional[str] = ..., channel: _Optional[str] = ..., event: _Optional[str] = ..., payload: _Optional[_Union[_struct_pb2.Value, _Mapping]] = ..., sender_id: _Optional[str] = ..., timestamp: _Optional[_Union[datetime.datetime, _timestamp_pb2.Timestamp, _Mapping]] = ..., metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...

class PresenceState(_message.Message):
    __slots__ = ("user_id", "channel", "status", "last_seen_at", "metadata")
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    CHANNEL_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    LAST_SEEN_AT_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    user_id: str
    channel: str
    status: str
    last_seen_at: _timestamp_pb2.Timestamp
    metadata: _struct_pb2.Struct
    def __init__(self, user_id: _Optional[str] = ..., channel: _Optional[str] = ..., status: _Optional[str] = ..., last_seen_at: _Optional[_Union[datetime.datetime, _timestamp_pb2.Timestamp, _Mapping]] = ..., metadata: _Optional[_Union[_struct_pb2.Struct, _Mapping]] = ...) -> None: ...
