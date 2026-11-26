from google.protobuf import struct_pb2 as _struct_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class SortDirection(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    SORT_DIRECTION_UNSPECIFIED: _ClassVar[SortDirection]
    SORT_DIRECTION_ASC: _ClassVar[SortDirection]
    SORT_DIRECTION_DESC: _ClassVar[SortDirection]

class FilterOperator(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    FILTER_OPERATOR_UNSPECIFIED: _ClassVar[FilterOperator]
    FILTER_OPERATOR_EQ: _ClassVar[FilterOperator]
    FILTER_OPERATOR_NEQ: _ClassVar[FilterOperator]
    FILTER_OPERATOR_IN: _ClassVar[FilterOperator]
    FILTER_OPERATOR_GT: _ClassVar[FilterOperator]
    FILTER_OPERATOR_GTE: _ClassVar[FilterOperator]
    FILTER_OPERATOR_LT: _ClassVar[FilterOperator]
    FILTER_OPERATOR_LTE: _ClassVar[FilterOperator]
    FILTER_OPERATOR_CONTAINS: _ClassVar[FilterOperator]
SORT_DIRECTION_UNSPECIFIED: SortDirection
SORT_DIRECTION_ASC: SortDirection
SORT_DIRECTION_DESC: SortDirection
FILTER_OPERATOR_UNSPECIFIED: FilterOperator
FILTER_OPERATOR_EQ: FilterOperator
FILTER_OPERATOR_NEQ: FilterOperator
FILTER_OPERATOR_IN: FilterOperator
FILTER_OPERATOR_GT: FilterOperator
FILTER_OPERATOR_GTE: FilterOperator
FILTER_OPERATOR_LT: FilterOperator
FILTER_OPERATOR_LTE: FilterOperator
FILTER_OPERATOR_CONTAINS: FilterOperator

class SortSpec(_message.Message):
    __slots__ = ("field", "direction")
    FIELD_FIELD_NUMBER: _ClassVar[int]
    DIRECTION_FIELD_NUMBER: _ClassVar[int]
    field: str
    direction: SortDirection
    def __init__(self, field: _Optional[str] = ..., direction: _Optional[_Union[SortDirection, str]] = ...) -> None: ...

class FilterSpec(_message.Message):
    __slots__ = ("field", "operator", "value")
    FIELD_FIELD_NUMBER: _ClassVar[int]
    OPERATOR_FIELD_NUMBER: _ClassVar[int]
    VALUE_FIELD_NUMBER: _ClassVar[int]
    field: str
    operator: FilterOperator
    value: _struct_pb2.Value
    def __init__(self, field: _Optional[str] = ..., operator: _Optional[_Union[FilterOperator, str]] = ..., value: _Optional[_Union[_struct_pb2.Value, _Mapping]] = ...) -> None: ...

class QuerySpec(_message.Message):
    __slots__ = ("filters", "sort", "limit", "offset", "cursor")
    FILTERS_FIELD_NUMBER: _ClassVar[int]
    SORT_FIELD_NUMBER: _ClassVar[int]
    LIMIT_FIELD_NUMBER: _ClassVar[int]
    OFFSET_FIELD_NUMBER: _ClassVar[int]
    CURSOR_FIELD_NUMBER: _ClassVar[int]
    filters: _containers.RepeatedCompositeFieldContainer[FilterSpec]
    sort: _containers.RepeatedCompositeFieldContainer[SortSpec]
    limit: int
    offset: int
    cursor: str
    def __init__(self, filters: _Optional[_Iterable[_Union[FilterSpec, _Mapping]]] = ..., sort: _Optional[_Iterable[_Union[SortSpec, _Mapping]]] = ..., limit: _Optional[int] = ..., offset: _Optional[int] = ..., cursor: _Optional[str] = ...) -> None: ...

class PageInfo(_message.Message):
    __slots__ = ("total", "limit", "offset", "has_more", "next_cursor")
    TOTAL_FIELD_NUMBER: _ClassVar[int]
    LIMIT_FIELD_NUMBER: _ClassVar[int]
    OFFSET_FIELD_NUMBER: _ClassVar[int]
    HAS_MORE_FIELD_NUMBER: _ClassVar[int]
    NEXT_CURSOR_FIELD_NUMBER: _ClassVar[int]
    total: int
    limit: int
    offset: int
    has_more: bool
    next_cursor: str
    def __init__(self, total: _Optional[int] = ..., limit: _Optional[int] = ..., offset: _Optional[int] = ..., has_more: _Optional[bool] = ..., next_cursor: _Optional[str] = ...) -> None: ...
