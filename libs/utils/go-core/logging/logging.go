// Package logging provides structured JSON logging built on log/slog with
// automatic context-propagated correlation ID injection.
package logging

import (
	"context"
	"io"
	"log/slog"
	"slices"
)

// CorrelationIDAttrKey is the structured log attribute key used for correlation IDs.
const CorrelationIDAttrKey = "correlation_id"

type correlationIDKey struct{}

// WithCorrelationID returns a derived context carrying the provided correlation ID.
// If ctx is nil, context.Background() is used as the parent.
func WithCorrelationID(ctx context.Context, id string) context.Context {
	if ctx == nil {
		ctx = context.Background()
	}
	return context.WithValue(ctx, correlationIDKey{}, id)
}

// CorrelationIDFromContext extracts a non-empty correlation ID from ctx.
// It returns ("", false) when ctx is nil or does not contain a non-empty correlation ID.
func CorrelationIDFromContext(ctx context.Context) (string, bool) {
	if ctx == nil {
		return "", false
	}
	id, ok := ctx.Value(correlationIDKey{}).(string)
	if !ok || id == "" {
		return "", false
	}
	return id, true
}

// CorrelationHandler wraps an slog.Handler and automatically injects the
// correlation_id attribute from context into each handled log record without
// mutating shared attribute slices.
type CorrelationHandler struct {
	next slog.Handler
}

// NewCorrelationHandler wraps next in a CorrelationHandler.
// If next is nil, it defaults to a JSON handler writing to io.Discard.
func NewCorrelationHandler(next slog.Handler) *CorrelationHandler {
	if next == nil {
		next = slog.NewJSONHandler(io.Discard, nil)
	}
	return &CorrelationHandler{next: next}
}

// Enabled delegates level filtering to the underlying handler.
func (h *CorrelationHandler) Enabled(ctx context.Context, level slog.Level) bool {
	return h.next.Enabled(ctx, level)
}

// Handle clones the record when a correlation ID is present in ctx, appends
// correlation_id, and delegates to the underlying handler.
func (h *CorrelationHandler) Handle(ctx context.Context, r slog.Record) error {
	if id, ok := CorrelationIDFromContext(ctx); ok {
		cloned := r.Clone()
		cloned.AddAttrs(slog.String(CorrelationIDAttrKey, id))
		return h.next.Handle(ctx, cloned)
	}
	return h.next.Handle(ctx, r)
}

// WithAttrs returns a new CorrelationHandler wrapping the underlying handler
// with a defensively cloned copy of attrs.
func (h *CorrelationHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	return &CorrelationHandler{
		next: h.next.WithAttrs(slices.Clone(attrs)),
	}
}

// WithGroup returns a new CorrelationHandler wrapping the underlying handler
// scoped to the specified attribute group.
func (h *CorrelationHandler) WithGroup(name string) slog.Handler {
	return &CorrelationHandler{
		next: h.next.WithGroup(name),
	}
}

// NewJSONLogger constructs an *slog.Logger that writes structured JSON records
// at or above level to w, automatically enriching records with correlation_id
// from context. If w is nil, io.Discard is used.
func NewJSONLogger(w io.Writer, level slog.Level) *slog.Logger {
	if w == nil {
		w = io.Discard
	}
	base := slog.NewJSONHandler(w, &slog.HandlerOptions{Level: level})
	return slog.New(NewCorrelationHandler(base))
}
