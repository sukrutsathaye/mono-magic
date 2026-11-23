// Package apperror provides structured, typed application errors with
// canonical error codes, defensive metadata cloning, error-chain wrapping,
// and JSON envelope serialization.
package apperror

import (
	"encoding/json"
	"errors"
	"fmt"
)

// ErrorCode classifies an AppError into a canonical, transport-agnostic category.
type ErrorCode string

const (
	// CodeValidation indicates invalid caller input or failed schema/business validation.
	CodeValidation ErrorCode = "VALIDATION"
	// CodeNotFound indicates a requested resource does not exist.
	CodeNotFound ErrorCode = "NOT_FOUND"
	// CodeUnauthorized indicates missing or invalid authentication credentials.
	CodeUnauthorized ErrorCode = "UNAUTHORIZED"
	// CodeForbidden indicates the authenticated principal lacks required permissions.
	CodeForbidden ErrorCode = "FORBIDDEN"
	// CodeConflict indicates a state conflict such as a duplicate key or version mismatch.
	CodeConflict ErrorCode = "CONFLICT"
	// CodeRateLimited indicates the caller exceeded an allowed request rate or quota.
	CodeRateLimited ErrorCode = "RATE_LIMITED"
	// CodeTimeout indicates an operation exceeded its deadline or timeout budget.
	CodeTimeout ErrorCode = "TIMEOUT"
	// CodeUnavailable indicates a downstream dependency or service is temporarily unavailable.
	CodeUnavailable ErrorCode = "UNAVAILABLE"
	// CodeInternal indicates an unexpected internal error.
	CodeInternal ErrorCode = "INTERNAL"
)

// DefaultRetryable reports whether errors with code are considered retryable by default.
func DefaultRetryable(code ErrorCode) bool {
	switch code {
	case CodeRateLimited, CodeTimeout, CodeUnavailable:
		return true
	default:
		return false
	}
}

// AppError represents a structured application error carrying a canonical code,
// human-readable message, defensively cloned details, retryability hint, and
// optional underlying cause.
type AppError struct {
	Code      ErrorCode
	Message   string
	Details   map[string]any
	Retryable bool
	Cause     error
}

// Envelope is the JSON-serializable wire representation of an AppError.
type Envelope struct {
	Code      ErrorCode      `json:"code"`
	Message   string         `json:"message"`
	Details   map[string]any `json:"details,omitempty"`
	Retryable bool           `json:"retryable"`
	Cause     string         `json:"cause,omitempty"`
}

// Option customizes an AppError during construction via New or Wrap.
type Option func(*AppError)

// WithDetails attaches a defensively cloned copy of details to the AppError.
// Subsequent mutations to the caller's map or nested maps/slices do not affect the error.
func WithDetails(details map[string]any) Option {
	return func(e *AppError) {
		e.Details = cloneMap(details)
	}
}

// WithRetryable explicitly overrides the default retryability derived from the ErrorCode.
func WithRetryable(retryable bool) Option {
	return func(e *AppError) {
		e.Retryable = retryable
	}
}

// New constructs a new AppError with the given code and message.
// Retryable defaults to DefaultRetryable(code) unless overridden with WithRetryable.
func New(code ErrorCode, message string, opts ...Option) *AppError {
	return Wrap(code, message, nil, opts...)
}

// Wrap constructs a new AppError wrapping cause with the given code and message.
// Retryable defaults to DefaultRetryable(code) unless overridden with WithRetryable.
func Wrap(code ErrorCode, message string, cause error, opts ...Option) *AppError {
	err := &AppError{
		Code:      code,
		Message:   message,
		Retryable: DefaultRetryable(code),
		Cause:     cause,
	}
	for _, opt := range opts {
		if opt != nil {
			opt(err)
		}
	}
	return err
}

// Error implements the standard error interface.
func (e *AppError) Error() string {
	if e == nil {
		return ""
	}
	if e.Cause != nil {
		return fmt.Sprintf("[%s] %s: %v", e.Code, e.Message, e.Cause)
	}
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

// Unwrap returns the underlying cause error for use with errors.Is and errors.As.
func (e *AppError) Unwrap() error {
	if e == nil {
		return nil
	}
	return e.Cause
}

// Is reports whether target matches this AppError.
// If target is an *AppError, it matches when codes are equal and either
// target.Message is empty or target.Message equals e.Message.
func (e *AppError) Is(target error) bool {
	if e == nil {
		return target == nil
	}
	t, ok := target.(*AppError)
	if !ok || t == nil {
		return false
	}
	if e.Code != t.Code {
		return false
	}
	return t.Message == "" || e.Message == t.Message
}

// CloneDetails returns a defensive deep copy of e.Details, or nil if Details is nil.
func (e *AppError) CloneDetails() map[string]any {
	if e == nil {
		return nil
	}
	return cloneMap(e.Details)
}

// ToEnvelope converts the AppError into its JSON-serializable Envelope with
// defensively cloned details.
func (e *AppError) ToEnvelope() Envelope {
	if e == nil {
		return Envelope{}
	}
	env := Envelope{
		Code:      e.Code,
		Message:   e.Message,
		Details:   cloneMap(e.Details),
		Retryable: e.Retryable,
	}
	if e.Cause != nil {
		env.Cause = e.Cause.Error()
	}
	return env
}

// MarshalJSON implements json.Marshaler by serializing the AppError as an Envelope.
func (e *AppError) MarshalJSON() ([]byte, error) {
	return json.Marshal(e.ToEnvelope())
}

// IsCode reports whether any *AppError in err's chain has the specified ErrorCode.
func IsCode(err error, code ErrorCode) bool {
	var appErr *AppError
	if !errors.As(err, &appErr) || appErr == nil {
		return false
	}
	return appErr.Code == code
}

// IsRetryable reports whether any *AppError in err's chain is marked as retryable.
func IsRetryable(err error) bool {
	var appErr *AppError
	if !errors.As(err, &appErr) || appErr == nil {
		return false
	}
	return appErr.Retryable
}

func cloneMap(src map[string]any) map[string]any {
	if src == nil {
		return nil
	}
	dst := make(map[string]any, len(src))
	for k, v := range src {
		dst[k] = cloneValue(v)
	}
	return dst
}

func cloneSlice(src []any) []any {
	if src == nil {
		return nil
	}
	dst := make([]any, len(src))
	for i, v := range src {
		dst[i] = cloneValue(v)
	}
	return dst
}

func cloneValue(v any) any {
	switch typed := v.(type) {
	case map[string]any:
		return cloneMap(typed)
	case []any:
		return cloneSlice(typed)
	default:
		return v
	}
}
