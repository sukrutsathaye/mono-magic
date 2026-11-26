from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ChatRole(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    CHAT_ROLE_UNSPECIFIED: _ClassVar[ChatRole]
    CHAT_ROLE_SYSTEM: _ClassVar[ChatRole]
    CHAT_ROLE_USER: _ClassVar[ChatRole]
    CHAT_ROLE_ASSISTANT: _ClassVar[ChatRole]
    CHAT_ROLE_TOOL: _ClassVar[ChatRole]
CHAT_ROLE_UNSPECIFIED: ChatRole
CHAT_ROLE_SYSTEM: ChatRole
CHAT_ROLE_USER: ChatRole
CHAT_ROLE_ASSISTANT: ChatRole
CHAT_ROLE_TOOL: ChatRole

class ChatMessage(_message.Message):
    __slots__ = ("role", "content", "tool_call_id")
    ROLE_FIELD_NUMBER: _ClassVar[int]
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    TOOL_CALL_ID_FIELD_NUMBER: _ClassVar[int]
    role: ChatRole
    content: str
    tool_call_id: str
    def __init__(self, role: _Optional[_Union[ChatRole, str]] = ..., content: _Optional[str] = ..., tool_call_id: _Optional[str] = ...) -> None: ...

class LLMCompletionRequest(_message.Message):
    __slots__ = ("model", "messages", "temperature", "max_tokens", "response_schema_name")
    MODEL_FIELD_NUMBER: _ClassVar[int]
    MESSAGES_FIELD_NUMBER: _ClassVar[int]
    TEMPERATURE_FIELD_NUMBER: _ClassVar[int]
    MAX_TOKENS_FIELD_NUMBER: _ClassVar[int]
    RESPONSE_SCHEMA_NAME_FIELD_NUMBER: _ClassVar[int]
    model: str
    messages: _containers.RepeatedCompositeFieldContainer[ChatMessage]
    temperature: float
    max_tokens: int
    response_schema_name: str
    def __init__(self, model: _Optional[str] = ..., messages: _Optional[_Iterable[_Union[ChatMessage, _Mapping]]] = ..., temperature: _Optional[float] = ..., max_tokens: _Optional[int] = ..., response_schema_name: _Optional[str] = ...) -> None: ...

class LLMCompletionResponse(_message.Message):
    __slots__ = ("content", "model", "prompt_tokens", "completion_tokens", "latency_ms")
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    MODEL_FIELD_NUMBER: _ClassVar[int]
    PROMPT_TOKENS_FIELD_NUMBER: _ClassVar[int]
    COMPLETION_TOKENS_FIELD_NUMBER: _ClassVar[int]
    LATENCY_MS_FIELD_NUMBER: _ClassVar[int]
    content: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    latency_ms: int
    def __init__(self, content: _Optional[str] = ..., model: _Optional[str] = ..., prompt_tokens: _Optional[int] = ..., completion_tokens: _Optional[int] = ..., latency_ms: _Optional[int] = ...) -> None: ...

class EmbeddingVector(_message.Message):
    __slots__ = ("id", "values", "metadata")
    class MetadataEntry(_message.Message):
        __slots__ = ("key", "value")
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    ID_FIELD_NUMBER: _ClassVar[int]
    VALUES_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    id: str
    values: _containers.RepeatedScalarFieldContainer[float]
    metadata: _containers.ScalarMap[str, str]
    def __init__(self, id: _Optional[str] = ..., values: _Optional[_Iterable[float]] = ..., metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...

class VectorSearchResult(_message.Message):
    __slots__ = ("id", "score", "metadata")
    class MetadataEntry(_message.Message):
        __slots__ = ("key", "value")
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    ID_FIELD_NUMBER: _ClassVar[int]
    SCORE_FIELD_NUMBER: _ClassVar[int]
    METADATA_FIELD_NUMBER: _ClassVar[int]
    id: str
    score: float
    metadata: _containers.ScalarMap[str, str]
    def __init__(self, id: _Optional[str] = ..., score: _Optional[float] = ..., metadata: _Optional[_Mapping[str, str]] = ...) -> None: ...

class AgentGraphRun(_message.Message):
    __slots__ = ("run_id", "graph_name", "status", "steps_executed", "output_json")
    RUN_ID_FIELD_NUMBER: _ClassVar[int]
    GRAPH_NAME_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    STEPS_EXECUTED_FIELD_NUMBER: _ClassVar[int]
    OUTPUT_JSON_FIELD_NUMBER: _ClassVar[int]
    run_id: str
    graph_name: str
    status: str
    steps_executed: int
    output_json: str
    def __init__(self, run_id: _Optional[str] = ..., graph_name: _Optional[str] = ..., status: _Optional[str] = ..., steps_executed: _Optional[int] = ..., output_json: _Optional[str] = ...) -> None: ...
