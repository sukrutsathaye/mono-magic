from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ContentSourceType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    CONTENT_SOURCE_TYPE_UNSPECIFIED: _ClassVar[ContentSourceType]
    CONTENT_SOURCE_TYPE_WIKIPEDIA: _ClassVar[ContentSourceType]
    CONTENT_SOURCE_TYPE_MARKDOWN: _ClassVar[ContentSourceType]
    CONTENT_SOURCE_TYPE_BOOK: _ClassVar[ContentSourceType]

class BloomLevel(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    BLOOM_LEVEL_UNSPECIFIED: _ClassVar[BloomLevel]
    BLOOM_LEVEL_REMEMBER: _ClassVar[BloomLevel]
    BLOOM_LEVEL_UNDERSTAND: _ClassVar[BloomLevel]
    BLOOM_LEVEL_APPLY: _ClassVar[BloomLevel]
    BLOOM_LEVEL_ANALYZE: _ClassVar[BloomLevel]
CONTENT_SOURCE_TYPE_UNSPECIFIED: ContentSourceType
CONTENT_SOURCE_TYPE_WIKIPEDIA: ContentSourceType
CONTENT_SOURCE_TYPE_MARKDOWN: ContentSourceType
CONTENT_SOURCE_TYPE_BOOK: ContentSourceType
BLOOM_LEVEL_UNSPECIFIED: BloomLevel
BLOOM_LEVEL_REMEMBER: BloomLevel
BLOOM_LEVEL_UNDERSTAND: BloomLevel
BLOOM_LEVEL_APPLY: BloomLevel
BLOOM_LEVEL_ANALYZE: BloomLevel

class TopicRecord(_message.Message):
    __slots__ = ("id", "title", "source_type", "chapter_count", "keywords")
    ID_FIELD_NUMBER: _ClassVar[int]
    TITLE_FIELD_NUMBER: _ClassVar[int]
    SOURCE_TYPE_FIELD_NUMBER: _ClassVar[int]
    CHAPTER_COUNT_FIELD_NUMBER: _ClassVar[int]
    KEYWORDS_FIELD_NUMBER: _ClassVar[int]
    id: str
    title: str
    source_type: ContentSourceType
    chapter_count: int
    keywords: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, id: _Optional[str] = ..., title: _Optional[str] = ..., source_type: _Optional[_Union[ContentSourceType, str]] = ..., chapter_count: _Optional[int] = ..., keywords: _Optional[_Iterable[str]] = ...) -> None: ...

class McqQuestion(_message.Message):
    __slots__ = ("id", "chapter_index", "prompt", "options", "correct_index", "bloom_level", "explanation")
    ID_FIELD_NUMBER: _ClassVar[int]
    CHAPTER_INDEX_FIELD_NUMBER: _ClassVar[int]
    PROMPT_FIELD_NUMBER: _ClassVar[int]
    OPTIONS_FIELD_NUMBER: _ClassVar[int]
    CORRECT_INDEX_FIELD_NUMBER: _ClassVar[int]
    BLOOM_LEVEL_FIELD_NUMBER: _ClassVar[int]
    EXPLANATION_FIELD_NUMBER: _ClassVar[int]
    id: str
    chapter_index: int
    prompt: str
    options: _containers.RepeatedScalarFieldContainer[str]
    correct_index: int
    bloom_level: BloomLevel
    explanation: str
    def __init__(self, id: _Optional[str] = ..., chapter_index: _Optional[int] = ..., prompt: _Optional[str] = ..., options: _Optional[_Iterable[str]] = ..., correct_index: _Optional[int] = ..., bloom_level: _Optional[_Union[BloomLevel, str]] = ..., explanation: _Optional[str] = ...) -> None: ...

class SubjectiveGradeResult(_message.Message):
    __slots__ = ("semantic_similarity", "final_score", "used_llm_rubric", "feedback")
    SEMANTIC_SIMILARITY_FIELD_NUMBER: _ClassVar[int]
    FINAL_SCORE_FIELD_NUMBER: _ClassVar[int]
    USED_LLM_RUBRIC_FIELD_NUMBER: _ClassVar[int]
    FEEDBACK_FIELD_NUMBER: _ClassVar[int]
    semantic_similarity: float
    final_score: float
    used_llm_rubric: bool
    feedback: str
    def __init__(self, semantic_similarity: _Optional[float] = ..., final_score: _Optional[float] = ..., used_llm_rubric: _Optional[bool] = ..., feedback: _Optional[str] = ...) -> None: ...
