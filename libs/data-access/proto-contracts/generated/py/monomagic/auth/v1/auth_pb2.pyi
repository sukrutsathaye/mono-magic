import datetime

from google.protobuf import struct_pb2 as _struct_pb2
from google.protobuf import timestamp_pb2 as _timestamp_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class OAuthProvider(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    O_AUTH_PROVIDER_UNSPECIFIED: _ClassVar[OAuthProvider]
    O_AUTH_PROVIDER_GOOGLE: _ClassVar[OAuthProvider]
    O_AUTH_PROVIDER_GITHUB: _ClassVar[OAuthProvider]
    O_AUTH_PROVIDER_APPLE: _ClassVar[OAuthProvider]
    O_AUTH_PROVIDER_MICROSOFT: _ClassVar[OAuthProvider]
    O_AUTH_PROVIDER_OIDC: _ClassVar[OAuthProvider]
O_AUTH_PROVIDER_UNSPECIFIED: OAuthProvider
O_AUTH_PROVIDER_GOOGLE: OAuthProvider
O_AUTH_PROVIDER_GITHUB: OAuthProvider
O_AUTH_PROVIDER_APPLE: OAuthProvider
O_AUTH_PROVIDER_MICROSOFT: OAuthProvider
O_AUTH_PROVIDER_OIDC: OAuthProvider

class UserClaims(_message.Message):
    __slots__ = ("user_id", "email", "email_verified", "display_name", "avatar_url", "roles", "tenant_id", "custom_claims")
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    EMAIL_VERIFIED_FIELD_NUMBER: _ClassVar[int]
    DISPLAY_NAME_FIELD_NUMBER: _ClassVar[int]
    AVATAR_URL_FIELD_NUMBER: _ClassVar[int]
    ROLES_FIELD_NUMBER: _ClassVar[int]
    TENANT_ID_FIELD_NUMBER: _ClassVar[int]
    CUSTOM_CLAIMS_FIELD_NUMBER: _ClassVar[int]
    user_id: str
    email: str
    email_verified: bool
    display_name: str
    avatar_url: str
    roles: _containers.RepeatedScalarFieldContainer[str]
    tenant_id: str
    custom_claims: _struct_pb2.Struct
    def __init__(self, user_id: _Optional[str] = ..., email: _Optional[str] = ..., email_verified: _Optional[bool] = ..., display_name: _Optional[str] = ..., avatar_url: _Optional[str] = ..., roles: _Optional[_Iterable[str]] = ..., tenant_id: _Optional[str] = ..., custom_claims: _Optional[_Union[_struct_pb2.Struct, _Mapping]] = ...) -> None: ...

class AuthSession(_message.Message):
    __slots__ = ("access_token", "refresh_token", "token_type", "expires_at", "user")
    ACCESS_TOKEN_FIELD_NUMBER: _ClassVar[int]
    REFRESH_TOKEN_FIELD_NUMBER: _ClassVar[int]
    TOKEN_TYPE_FIELD_NUMBER: _ClassVar[int]
    EXPIRES_AT_FIELD_NUMBER: _ClassVar[int]
    USER_FIELD_NUMBER: _ClassVar[int]
    access_token: str
    refresh_token: str
    token_type: str
    expires_at: _timestamp_pb2.Timestamp
    user: UserClaims
    def __init__(self, access_token: _Optional[str] = ..., refresh_token: _Optional[str] = ..., token_type: _Optional[str] = ..., expires_at: _Optional[_Union[datetime.datetime, _timestamp_pb2.Timestamp, _Mapping]] = ..., user: _Optional[_Union[UserClaims, _Mapping]] = ...) -> None: ...

class SignInRequest(_message.Message):
    __slots__ = ("email", "password", "oauth_provider", "redirect_uri", "authorization_code", "scopes", "tenant_id")
    EMAIL_FIELD_NUMBER: _ClassVar[int]
    PASSWORD_FIELD_NUMBER: _ClassVar[int]
    OAUTH_PROVIDER_FIELD_NUMBER: _ClassVar[int]
    REDIRECT_URI_FIELD_NUMBER: _ClassVar[int]
    AUTHORIZATION_CODE_FIELD_NUMBER: _ClassVar[int]
    SCOPES_FIELD_NUMBER: _ClassVar[int]
    TENANT_ID_FIELD_NUMBER: _ClassVar[int]
    email: str
    password: str
    oauth_provider: OAuthProvider
    redirect_uri: str
    authorization_code: str
    scopes: _containers.RepeatedScalarFieldContainer[str]
    tenant_id: str
    def __init__(self, email: _Optional[str] = ..., password: _Optional[str] = ..., oauth_provider: _Optional[_Union[OAuthProvider, str]] = ..., redirect_uri: _Optional[str] = ..., authorization_code: _Optional[str] = ..., scopes: _Optional[_Iterable[str]] = ..., tenant_id: _Optional[str] = ...) -> None: ...
