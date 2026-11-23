package apperror_test

import (
	"encoding/json"
	"errors"
	"fmt"
	"testing"

	"github.com/sukrutsathaye/mono-magic/libs/utils/go-core/apperror"
)

func TestDefaultRetryable(t *testing.T) {
	t.Parallel()

	cases := []struct {
		code      apperror.ErrorCode
		retryable bool
	}{
		{apperror.CodeValidation, false},
		{apperror.CodeNotFound, false},
		{apperror.CodeUnauthorized, false},
		{apperror.CodeForbidden, false},
		{apperror.CodeConflict, false},
		{apperror.CodeRateLimited, true},
		{apperror.CodeTimeout, true},
		{apperror.CodeUnavailable, true},
		{apperror.CodeInternal, false},
	}

	for _, tc := range cases {
		if got := apperror.DefaultRetryable(tc.code); got != tc.retryable {
			t.Errorf("DefaultRetryable(%q) = %v, want %v", tc.code, got, tc.retryable)
		}
	}
}

func TestNewAndWrap(t *testing.T) {
	t.Parallel()

	sentinel := errors.New("db connection refused")
	err := apperror.Wrap(
		apperror.CodeUnavailable,
		"database unavailable",
		sentinel,
		nil,
		apperror.WithRetryable(false),
	)

	if err.Code != apperror.CodeUnavailable {
		t.Fatalf("Code = %q, want %q", err.Code, apperror.CodeUnavailable)
	}
	if err.Retryable {
		t.Fatalf("Retryable = true, want false after WithRetryable(false)")
	}
	if got := err.Error(); got != "[UNAVAILABLE] database unavailable: db connection refused" {
		t.Fatalf("Error() = %q", got)
	}
	if !errors.Is(err, sentinel) {
		t.Fatalf("errors.Is(err, sentinel) = false, want true")
	}

	plain := apperror.New(apperror.CodeNotFound, "user not found")
	if got := plain.Error(); got != "[NOT_FOUND] user not found" {
		t.Fatalf("Error() = %q", got)
	}
	if plain.Unwrap() != nil {
		t.Fatalf("Unwrap() = %v, want nil", plain.Unwrap())
	}
}

func TestDetailsDefensiveCloning(t *testing.T) {
	t.Parallel()

	input := map[string]any{
		"field": "email",
		"nested": map[string]any{
			"min": 3,
		},
		"items": []any{"a", map[string]any{"k": "v"}},
	}

	err := apperror.New(apperror.CodeValidation, "invalid input", apperror.WithDetails(input))

	// Mutate original input after construction.
	input["field"] = "mutated"
	input["nested"].(map[string]any)["min"] = 99
	input["items"].([]any)[0] = "z"
	input["items"].([]any)[1].(map[string]any)["k"] = "mutated"

	cloned := err.CloneDetails()
	if cloned["field"] != "email" {
		t.Fatalf("Details[field] mutated to %v", cloned["field"])
	}
	if cloned["nested"].(map[string]any)["min"] != 3 {
		t.Fatalf("Details[nested][min] mutated to %v", cloned["nested"].(map[string]any)["min"])
	}
	if cloned["items"].([]any)[0] != "a" {
		t.Fatalf("Details[items][0] mutated to %v", cloned["items"].([]any)[0])
	}
	if cloned["items"].([]any)[1].(map[string]any)["k"] != "v" {
		t.Fatalf("Details[items][1][k] mutated to %v", cloned["items"].([]any)[1].(map[string]any)["k"])
	}

	// Mutate CloneDetails result and verify err.Details is unaffected.
	cloned["field"] = "mutated-again"
	if err.Details["field"] != "email" {
		t.Fatalf("err.Details mutated via CloneDetails")
	}

	// Nil details and nil slice handling.
	nilDetailsErr := apperror.New(apperror.CodeInternal, "boom", apperror.WithDetails(nil))
	if nilDetailsErr.CloneDetails() != nil {
		t.Fatalf("CloneDetails() = %v, want nil", nilDetailsErr.CloneDetails())
	}
	var nilSlice []any
	nilSliceErr := apperror.New(apperror.CodeInternal, "boom", apperror.WithDetails(map[string]any{"s": nilSlice}))
	if got, ok := nilSliceErr.Details["s"].([]any); !ok || got != nil {
		t.Fatalf("expected nil []any slice to stay nil, got %#v", nilSliceErr.Details["s"])
	}
}

func TestErrorsIsAsAndHelpers(t *testing.T) {
	t.Parallel()

	root := errors.New("socket timeout")
	appErr := apperror.Wrap(apperror.CodeTimeout, "upstream timed out", root)
	wrapped := fmt.Errorf("request failed: %w", appErr)

	if !errors.Is(wrapped, &apperror.AppError{Code: apperror.CodeTimeout}) {
		t.Fatalf("expected errors.Is to match by Code")
	}
	if !errors.Is(wrapped, &apperror.AppError{Code: apperror.CodeTimeout, Message: "upstream timed out"}) {
		t.Fatalf("expected errors.Is to match by Code and Message")
	}
	if errors.Is(wrapped, &apperror.AppError{Code: apperror.CodeTimeout, Message: "different"}) {
		t.Fatalf("expected errors.Is to reject mismatched Message")
	}
	if errors.Is(wrapped, &apperror.AppError{Code: apperror.CodeNotFound}) {
		t.Fatalf("expected errors.Is to reject mismatched Code")
	}
	if appErr.Is(errors.New("other")) {
		t.Fatalf("expected Is to return false for non-AppError")
	}
	if appErr.Is((*apperror.AppError)(nil)) {
		t.Fatalf("expected Is to return false for typed nil *AppError")
	}

	var extracted *apperror.AppError
	if !errors.As(wrapped, &extracted) {
		t.Fatalf("errors.As failed to extract *AppError")
	}
	if extracted.Code != apperror.CodeTimeout {
		t.Fatalf("extracted.Code = %q, want %q", extracted.Code, apperror.CodeTimeout)
	}

	if !apperror.IsCode(wrapped, apperror.CodeTimeout) {
		t.Fatalf("IsCode returned false, want true")
	}
	if apperror.IsCode(wrapped, apperror.CodeConflict) {
		t.Fatalf("IsCode returned true for wrong code")
	}
	if apperror.IsCode(errors.New("plain"), apperror.CodeInternal) {
		t.Fatalf("IsCode returned true for non-AppError")
	}
	if !apperror.IsRetryable(wrapped) {
		t.Fatalf("IsRetryable returned false, want true")
	}
	if apperror.IsRetryable(errors.New("plain")) {
		t.Fatalf("IsRetryable returned true for non-AppError")
	}
}

func TestMarshalJSONAndEnvelope(t *testing.T) {
	t.Parallel()

	err := apperror.Wrap(
		apperror.CodeRateLimited,
		"too many requests",
		errors.New("quota exceeded"),
		apperror.WithDetails(map[string]any{"retry_after_sec": 30}),
	)

	raw, marshalErr := json.Marshal(err)
	if marshalErr != nil {
		t.Fatalf("json.Marshal failed: %v", marshalErr)
	}

	var env apperror.Envelope
	if unmarshalErr := json.Unmarshal(raw, &env); unmarshalErr != nil {
		t.Fatalf("json.Unmarshal failed: %v", unmarshalErr)
	}

	if env.Code != apperror.CodeRateLimited {
		t.Errorf("env.Code = %q, want %q", env.Code, apperror.CodeRateLimited)
	}
	if env.Message != "too many requests" {
		t.Errorf("env.Message = %q", env.Message)
	}
	if !env.Retryable {
		t.Errorf("env.Retryable = false, want true")
	}
	if env.Cause != "quota exceeded" {
		t.Errorf("env.Cause = %q, want %q", env.Cause, "quota exceeded")
	}
	if env.Details["retry_after_sec"] != float64(30) {
		t.Errorf("env.Details[retry_after_sec] = %v, want 30", env.Details["retry_after_sec"])
	}
}

func TestNilReceiverSafety(t *testing.T) {
	t.Parallel()

	var nilErr *apperror.AppError
	if nilErr.Error() != "" {
		t.Errorf("nilErr.Error() = %q, want empty", nilErr.Error())
	}
	if nilErr.Unwrap() != nil {
		t.Errorf("nilErr.Unwrap() = %v, want nil", nilErr.Unwrap())
	}
	if !nilErr.Is(nil) {
		t.Errorf("nilErr.Is(nil) = false, want true")
	}
	if nilErr.Is(errors.New("x")) {
		t.Errorf("nilErr.Is(non-nil) = true, want false")
	}
	if nilErr.CloneDetails() != nil {
		t.Errorf("nilErr.CloneDetails() = %v, want nil", nilErr.CloneDetails())
	}
	if env := nilErr.ToEnvelope(); env.Code != "" || env.Message != "" {
		t.Errorf("nilErr.ToEnvelope() = %+v, want zero", env)
	}
}
