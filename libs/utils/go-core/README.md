# `go-utils-core` (`libs/utils/go-core`)

Pure, zero-dependency Go standard library (`go 1.24.3`) core utility packages for `mono-magic` Go services and tools.

## Nx Targets

```bash
pnpm nx lint go-utils-core   # go vet ./...
pnpm nx test go-utils-core   # go test -race -cover ./...
pnpm nx build go-utils-core  # go build ./...
```

## Packages

### 1. `apperror`
Structured application errors with canonical `ErrorCode` constants (`CodeValidation`, `CodeNotFound`, `CodeUnauthorized`, `CodeForbidden`, `CodeConflict`, `CodeRateLimited`, `CodeTimeout`, `CodeUnavailable`, `CodeInternal`), defensive deep cloning of `Details`, full `errors.Is`/`errors.As`/`Unwrap` support, and JSON `Envelope` serialization.

```go
err := apperror.Wrap(
	apperror.CodeUnavailable,
	"upstream datastore unavailable",
	cause,
	apperror.WithDetails(map[string]any{"region": "us-east-1"}),
)
if apperror.IsRetryable(err) {
	// schedule retry
}
```

### 2. `retry`
`context.Context`-aware exponential backoff with configurable symmetric jitter and injectable `Sleep` / `RandFloat64` hooks for deterministic unit tests.

```go
cfg := retry.DefaultConfig()
cfg.ShouldRetry = apperror.IsRetryable

result, err := retry.Do(ctx, cfg, func(ctx context.Context) (string, error) {
	return fetchRemote(ctx)
})
```

### 3. `logging`
Structured JSON logging built on `log/slog` with automatic context-propagated `correlation_id` injection and defensive attribute slice cloning.

```go
logger := logging.NewJSONLogger(os.Stdout, slog.LevelInfo)
ctx := logging.WithCorrelationID(context.Background(), "req-42")
logger.InfoContext(ctx, "request completed", slog.Int("status", 200))
```

### 4. `telemetry`
Thread-safe in-memory telemetry primitives:
- `RingBuffer[T]`: Fixed-capacity FIFO circular buffer protected by `sync.RWMutex`.
- `SlidingWindow`: Time-bounded numeric aggregator computing `Count`, `Sum`, `Min`, `Max`, `Mean`, and nearest-rank `P95` while evicting expired samples.

```go
sw := telemetry.NewSlidingWindow(time.Minute)
sw.Add(time.Now(), 42.0)
stats := sw.Stats(time.Now())
fmt.Printf("count=%d mean=%.2f p95=%.2f\n", stats.Count, stats.Mean, stats.P95)
```
