package logging_test

import (
	"bytes"
	"context"
	"encoding/json"
	"log/slog"
	"strings"
	"sync"
	"testing"

	"github.com/sukrutsathaye/mono-magic/libs/utils/go-core/logging"
)

func TestCorrelationIDContextRoundTrip(t *testing.T) {
	t.Parallel()

	var nilCtx context.Context
	if id, ok := logging.CorrelationIDFromContext(nilCtx); ok || id != "" {
		t.Fatalf("expected empty/false for nil context, got (%q, %v)", id, ok)
	}
	if id, ok := logging.CorrelationIDFromContext(context.Background()); ok || id != "" {
		t.Fatalf("expected empty/false for bare context, got (%q, %v)", id, ok)
	}

	ctxFromNil := logging.WithCorrelationID(nilCtx, "req-123")
	if id, ok := logging.CorrelationIDFromContext(ctxFromNil); !ok || id != "req-123" {
		t.Fatalf("got (%q, %v), want (\"req-123\", true)", id, ok)
	}

	emptyCtx := logging.WithCorrelationID(context.Background(), "")
	if id, ok := logging.CorrelationIDFromContext(emptyCtx); ok || id != "" {
		t.Fatalf("expected empty/false for empty correlation ID, got (%q, %v)", id, ok)
	}
}

func TestNewJSONLoggerInjectsCorrelationID(t *testing.T) {
	t.Parallel()

	var buf bytes.Buffer
	logger := logging.NewJSONLogger(&buf, slog.LevelInfo)

	ctx := logging.WithCorrelationID(context.Background(), "corr-abc-42")
	logger.InfoContext(ctx, "order processed", slog.String("order_id", "ord-9"))

	var record map[string]any
	if err := json.Unmarshal(buf.Bytes(), &record); err != nil {
		t.Fatalf("invalid JSON output %q: %v", buf.String(), err)
	}

	if record["msg"] != "order processed" {
		t.Errorf("msg = %v, want \"order processed\"", record["msg"])
	}
	if record["order_id"] != "ord-9" {
		t.Errorf("order_id = %v, want \"ord-9\"", record["order_id"])
	}
	if record[logging.CorrelationIDAttrKey] != "corr-abc-42" {
		t.Errorf("correlation_id = %v, want \"corr-abc-42\"", record[logging.CorrelationIDAttrKey])
	}
}

func TestNewJSONLoggerWithoutCorrelationIDAndLevelFiltering(t *testing.T) {
	t.Parallel()

	var buf bytes.Buffer
	logger := logging.NewJSONLogger(&buf, slog.LevelWarn)

	logger.InfoContext(context.Background(), "ignored info")
	if buf.Len() != 0 {
		t.Fatalf("expected info log to be filtered out at warn level, got %q", buf.String())
	}

	logger.WarnContext(context.Background(), "disk nearly full")
	var record map[string]any
	if err := json.Unmarshal(buf.Bytes(), &record); err != nil {
		t.Fatalf("invalid JSON output: %v", err)
	}
	if _, exists := record[logging.CorrelationIDAttrKey]; exists {
		t.Fatalf("expected no correlation_id attribute when absent from context")
	}
}

func TestWithAttrsDefensiveCopyAndWithGroup(t *testing.T) {
	t.Parallel()

	var buf bytes.Buffer
	base := logging.NewCorrelationHandler(slog.NewJSONHandler(&buf, &slog.HandlerOptions{Level: slog.LevelInfo}))

	attrs := []slog.Attr{slog.String("service", "billing")}
	derived := base.WithAttrs(attrs).WithGroup("http")

	// Mutate caller's slice after WithAttrs.
	attrs[0] = slog.String("service", "mutated")

	logger := slog.New(derived)
	ctx := logging.WithCorrelationID(context.Background(), "trace-77")
	logger.InfoContext(ctx, "request handled", slog.Int("status", 200))

	var record map[string]any
	if err := json.Unmarshal(buf.Bytes(), &record); err != nil {
		t.Fatalf("invalid JSON output: %v", err)
	}
	if record["service"] != "billing" {
		t.Errorf("service = %v, want \"billing\"", record["service"])
	}
	httpGroup, ok := record["http"].(map[string]any)
	if !ok {
		t.Fatalf("expected http group object, got %T", record["http"])
	}
	if httpGroup["status"] != float64(200) {
		t.Errorf("http.status = %v, want 200", httpGroup["status"])
	}
	if httpGroup[logging.CorrelationIDAttrKey] != "trace-77" {
		t.Errorf("http.correlation_id = %v, want \"trace-77\"", httpGroup[logging.CorrelationIDAttrKey])
	}
}

func TestNilWriterAndNilHandlerFallbacks(t *testing.T) {
	t.Parallel()

	logger := logging.NewJSONLogger(nil, slog.LevelDebug)
	logger.DebugContext(logging.WithCorrelationID(context.Background(), "id-1"), "discarded safely")

	h := logging.NewCorrelationHandler(nil)
	if !h.Enabled(context.Background(), slog.LevelInfo) {
		t.Fatalf("expected default nil handler fallback to enable Info level")
	}
}

type syncBuffer struct {
	mu  sync.Mutex
	buf bytes.Buffer
}

func (s *syncBuffer) Write(p []byte) (int, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.buf.Write(p)
}

func TestConcurrentCorrelationLoggingRaceFree(t *testing.T) {
	t.Parallel()

	out := &syncBuffer{}
	logger := logging.NewJSONLogger(out, slog.LevelInfo)

	const workers = 16
	var wg sync.WaitGroup
	wg.Add(workers)
	for i := 0; i < workers; i++ {
		go func(id int) {
			defer wg.Done()
			ctx := logging.WithCorrelationID(context.Background(), "worker-"+string(rune('A'+id)))
			logger.InfoContext(ctx, "concurrent log", slog.Int("worker", id))
		}(i)
	}
	wg.Wait()

	lines := strings.Split(strings.TrimSpace(out.buf.String()), "\n")
	if len(lines) != workers {
		t.Fatalf("got %d log lines, want %d", len(lines), workers)
	}
	for _, line := range lines {
		var rec map[string]any
		if err := json.Unmarshal([]byte(line), &rec); err != nil {
			t.Fatalf("invalid JSON line %q: %v", line, err)
		}
		if rec[logging.CorrelationIDAttrKey] == "" {
			t.Fatalf("missing correlation_id in line %q", line)
		}
	}
}
