package retry_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/sukrutsathaye/mono-magic/libs/utils/go-core/retry"
)

func TestDoImmediateSuccess(t *testing.T) {
	t.Parallel()

	calls := 0
	val, err := retry.Do(context.Background(), retry.DefaultConfig(), func(ctx context.Context) (string, error) {
		calls++
		return "ok", nil
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if val != "ok" || calls != 1 {
		t.Fatalf("got (%q, calls=%d), want (\"ok\", calls=1)", val, calls)
	}
}

func TestDoRetriesThenSucceedsWithDeterministicBackoff(t *testing.T) {
	t.Parallel()

	var recordedDelays []time.Duration
	cfg := retry.Config{
		MaxAttempts:  4,
		InitialDelay: 10 * time.Millisecond,
		MaxDelay:     25 * time.Millisecond,
		Multiplier:   2.0,
		JitterFactor: 0.0,
		Sleep: func(ctx context.Context, d time.Duration) error {
			recordedDelays = append(recordedDelays, d)
			return nil
		},
	}

	attempts := 0
	transient := errors.New("temporary failure")
	val, err := retry.Do(context.Background(), cfg, func(ctx context.Context) (int, error) {
		attempts++
		if attempts < 4 {
			return 0, transient
		}
		return 42, nil
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if val != 42 || attempts != 4 {
		t.Fatalf("got (%d, attempts=%d), want (42, attempts=4)", val, attempts)
	}

	wantDelays := []time.Duration{
		10 * time.Millisecond,
		20 * time.Millisecond,
		25 * time.Millisecond, // capped at MaxDelay
	}
	if len(recordedDelays) != len(wantDelays) {
		t.Fatalf("recorded %d delays, want %d", len(recordedDelays), len(wantDelays))
	}
	for i, want := range wantDelays {
		if recordedDelays[i] != want {
			t.Errorf("delay[%d] = %v, want %v", i, recordedDelays[i], want)
		}
	}
}

func TestDoExhaustsAttempts(t *testing.T) {
	t.Parallel()

	sentinel := errors.New("still failing")
	attempts := 0
	cfg := retry.Config{
		MaxAttempts: 3,
		Sleep:       func(context.Context, time.Duration) error { return nil },
	}

	_, err := retry.Do(context.Background(), cfg, func(ctx context.Context) (int, error) {
		attempts++
		return 0, sentinel
	})
	if !errors.Is(err, sentinel) {
		t.Fatalf("got err %v, want %v", err, sentinel)
	}
	if attempts != 3 {
		t.Fatalf("attempts = %d, want 3", attempts)
	}
}

func TestDoStopsWhenShouldRetryFalse(t *testing.T) {
	t.Parallel()

	fatalErr := errors.New("validation failed")
	attempts := 0
	cfg := retry.Config{
		MaxAttempts: 5,
		ShouldRetry: func(err error) bool { return !errors.Is(err, fatalErr) },
		Sleep:       func(context.Context, time.Duration) error { return nil },
	}

	_, err := retry.Do(context.Background(), cfg, func(ctx context.Context) (string, error) {
		attempts++
		return "", fatalErr
	})
	if !errors.Is(err, fatalErr) {
		t.Fatalf("got err %v, want %v", err, fatalErr)
	}
	if attempts != 1 {
		t.Fatalf("attempts = %d, want 1", attempts)
	}
}

func TestDoNilFuncAndNilContext(t *testing.T) {
	t.Parallel()

	if _, err := retry.Do[int](context.Background(), retry.DefaultConfig(), nil); !errors.Is(err, retry.ErrNilFunc) {
		t.Fatalf("got err %v, want ErrNilFunc", err)
	}

	// Passing nil context should safely fall back to context.Background().
	var nilCtx context.Context
	val, err := retry.Do(nilCtx, retry.DefaultConfig(), func(ctx context.Context) (string, error) {
		if ctx == nil {
			t.Error("expected non-nil context inside fn")
		}
		return "done", nil
	})
	if err != nil || val != "done" {
		t.Fatalf("got (%q, %v), want (\"done\", nil)", val, err)
	}
}

func TestDoHonorsContextCancellation(t *testing.T) {
	t.Parallel()

	t.Run("already canceled before start", func(t *testing.T) {
		t.Parallel()
		ctx, cancel := context.WithCancel(context.Background())
		cancel()

		calls := 0
		_, err := retry.Do(ctx, retry.DefaultConfig(), func(ctx context.Context) (int, error) {
			calls++
			return 0, nil
		})
		if !errors.Is(err, context.Canceled) {
			t.Fatalf("got err %v, want context.Canceled", err)
		}
		if calls != 0 {
			t.Fatalf("calls = %d, want 0", calls)
		}
	})

	t.Run("canceled during operation", func(t *testing.T) {
		t.Parallel()
		ctx, cancel := context.WithCancel(context.Background())

		calls := 0
		_, err := retry.Do(ctx, retry.Config{
			MaxAttempts: 5,
			Sleep:       func(context.Context, time.Duration) error { return nil },
		}, func(ctx context.Context) (int, error) {
			calls++
			cancel()
			return 0, errors.New("boom")
		})
		if !errors.Is(err, context.Canceled) {
			t.Fatalf("got err %v, want context.Canceled", err)
		}
		if calls != 1 {
			t.Fatalf("calls = %d, want 1", calls)
		}
	})

	t.Run("canceled during real default sleep", func(t *testing.T) {
		t.Parallel()
		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Millisecond)
		defer cancel()

		cfg := retry.Config{
			MaxAttempts:  5,
			InitialDelay: 5 * time.Second,
			MaxDelay:     5 * time.Second,
			JitterFactor: 0,
		}
		start := time.Now()
		_, err := retry.Do(ctx, cfg, func(ctx context.Context) (int, error) {
			return 0, errors.New("transient")
		})
		if !errors.Is(err, context.DeadlineExceeded) {
			t.Fatalf("got err %v, want context.DeadlineExceeded", err)
		}
		if elapsed := time.Since(start); elapsed > time.Second {
			t.Fatalf("sleep did not abort promptly on deadline: elapsed=%v", elapsed)
		}
	})

	t.Run("real default sleep completes normally", func(t *testing.T) {
		t.Parallel()
		attempts := 0
		cfg := retry.Config{
			MaxAttempts:  2,
			InitialDelay: 2 * time.Millisecond,
			MaxDelay:     5 * time.Millisecond,
			JitterFactor: 0,
		}
		val, err := retry.Do(context.Background(), cfg, func(ctx context.Context) (string, error) {
			attempts++
			if attempts == 1 {
				return "", errors.New("retry me")
			}
			return "recovered", nil
		})
		if err != nil || val != "recovered" {
			t.Fatalf("got (%q, %v), want (\"recovered\", nil)", val, err)
		}
	})
}

func TestComputeDelayEdgeCasesAndJitter(t *testing.T) {
	t.Parallel()

	// Negative/out-of-range config values are normalized safely.
	minJitterCfg := retry.Config{
		InitialDelay: 100 * time.Millisecond,
		MaxDelay:     50 * time.Millisecond, // smaller than InitialDelay -> clamped to 100ms
		Multiplier:   2.0,
		JitterFactor: 0.5,
		RandFloat64:  func() float64 { return 0.0 },
	}
	if d := retry.ComputeDelay(0, minJitterCfg); d != 50*time.Millisecond {
		t.Fatalf("ComputeDelay(min jitter) = %v, want 50ms", d)
	}

	maxJitterCfg := minJitterCfg
	maxJitterCfg.RandFloat64 = func() float64 { return 1.0 }
	if d := retry.ComputeDelay(1, maxJitterCfg); d != 150*time.Millisecond {
		t.Fatalf("ComputeDelay(max jitter) = %v, want 150ms", d)
	}

	// Out-of-range JitterFactor and RandFloat64 are clamped.
	clampedCfg := retry.Config{
		InitialDelay: 100 * time.Millisecond,
		MaxDelay:     200 * time.Millisecond,
		Multiplier:   2.0,
		JitterFactor: 5.0,                            // clamped to 1.0
		RandFloat64:  func() float64 { return -0.5 }, // clamped to 0.0 -> factor 0
	}
	if d := retry.ComputeDelay(1, clampedCfg); d != 0 {
		t.Fatalf("ComputeDelay(clamped min) = %v, want 0", d)
	}

	clampedHighCfg := clampedCfg
	clampedHighCfg.RandFloat64 = func() float64 { return 2.5 } // clamped to 1.0 -> factor 2.0
	if d := retry.ComputeDelay(1, clampedHighCfg); d != 200*time.Millisecond {
		t.Fatalf("ComputeDelay(clamped max) = %v, want 200ms", d)
	}

	// Negative JitterFactor clamped to 0; huge attempt overflows math.Pow and caps at MaxDelay.
	overflowCfg := retry.Config{
		InitialDelay: 10 * time.Millisecond,
		MaxDelay:     500 * time.Millisecond,
		Multiplier:   10.0,
		JitterFactor: -1.0,
	}
	if d := retry.ComputeDelay(1000, overflowCfg); d != 500*time.Millisecond {
		t.Fatalf("ComputeDelay(overflow) = %v, want 500ms", d)
	}
}
