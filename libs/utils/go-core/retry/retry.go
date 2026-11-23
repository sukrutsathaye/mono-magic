// Package retry provides context-aware exponential backoff with configurable
// jitter and deterministic hooks for fast unit testing.
package retry

import (
	"context"
	"errors"
	"math"
	"math/rand/v2"
	"time"
)

const (
	defaultMaxAttempts  = 3
	defaultInitialDelay = 100 * time.Millisecond
	defaultMaxDelay     = 30 * time.Second
	defaultMultiplier   = 2.0
	defaultJitterFactor = 0.2
)

// ErrNilFunc is returned when Do is invoked with a nil operation function.
var ErrNilFunc = errors.New("retry: operation function must not be nil")

// Config configures retry behavior for Do.
type Config struct {
	// MaxAttempts is the total number of attempts including the initial call.
	// Values <= 0 default to 3.
	MaxAttempts int
	// InitialDelay is the base delay before the second attempt.
	// Values <= 0 default to 100ms.
	InitialDelay time.Duration
	// MaxDelay caps the computed backoff delay before jitter is applied.
	// Values <= 0 default to 30s. If smaller than InitialDelay, it is clamped to InitialDelay.
	MaxDelay time.Duration
	// Multiplier scales the delay exponentially on each subsequent retry.
	// Values <= 0 default to 2.0.
	Multiplier float64
	// JitterFactor specifies symmetric random jitter in [0, 1].
	// For example, 0.2 varies the delay uniformly within [0.8*base, 1.2*base].
	// Values < 0 are clamped to 0; values > 1 are clamped to 1.
	JitterFactor float64
	// ShouldRetry determines whether a returned error should be retried.
	// When nil, all non-nil errors are retried unless the context is done.
	ShouldRetry func(error) bool
	// Sleep overrides the wait function between attempts (primarily for tests).
	// When nil, a context-aware timer is used.
	Sleep func(ctx context.Context, d time.Duration) error
	// RandFloat64 overrides the random number generator returning values in [0.0, 1.0).
	// When nil, math/rand/v2.Float64 is used.
	RandFloat64 func() float64
}

// DefaultConfig returns a Config populated with production-ready defaults.
func DefaultConfig() Config {
	return Config{
		MaxAttempts:  defaultMaxAttempts,
		InitialDelay: defaultInitialDelay,
		MaxDelay:     defaultMaxDelay,
		Multiplier:   defaultMultiplier,
		JitterFactor: defaultJitterFactor,
	}
}

func (c Config) normalized() Config {
	out := c
	if out.MaxAttempts <= 0 {
		out.MaxAttempts = defaultMaxAttempts
	}
	if out.InitialDelay <= 0 {
		out.InitialDelay = defaultInitialDelay
	}
	if out.MaxDelay <= 0 {
		out.MaxDelay = defaultMaxDelay
	}
	if out.MaxDelay < out.InitialDelay {
		out.MaxDelay = out.InitialDelay
	}
	if out.Multiplier <= 0 {
		out.Multiplier = defaultMultiplier
	}
	if out.JitterFactor < 0 {
		out.JitterFactor = 0
	} else if out.JitterFactor > 1 {
		out.JitterFactor = 1
	}
	if out.Sleep == nil {
		out.Sleep = defaultSleep
	}
	if out.RandFloat64 == nil {
		out.RandFloat64 = rand.Float64
	}
	return out
}

// ComputeDelay calculates the backoff duration for the given 1-indexed failed
// attempt number (attempt 1 is the first failure before retry 1).
func ComputeDelay(attempt int, cfg Config) time.Duration {
	norm := cfg.normalized()
	if attempt < 1 {
		attempt = 1
	}

	exp := math.Pow(norm.Multiplier, float64(attempt-1))
	baseFloat := float64(norm.InitialDelay) * exp
	maxFloat := float64(norm.MaxDelay)
	if math.IsInf(baseFloat, 0) || math.IsNaN(baseFloat) || baseFloat > maxFloat {
		baseFloat = maxFloat
	}

	if norm.JitterFactor > 0 {
		r := norm.RandFloat64()
		if r < 0 {
			r = 0
		} else if r > 1 {
			r = 1
		}
		// Symmetric jitter around baseFloat in [1-jitter, 1+jitter].
		factor := 1.0 + (2.0*r-1.0)*norm.JitterFactor
		baseFloat *= factor
	}

	if baseFloat < 0 {
		return 0
	}
	return time.Duration(baseFloat)
}

// Do executes fn with exponential backoff and jitter until it succeeds,
// returns a non-retryable error, exhausts cfg.MaxAttempts, or ctx is canceled.
func Do[T any](ctx context.Context, cfg Config, fn func(context.Context) (T, error)) (T, error) {
	var zero T
	if fn == nil {
		return zero, ErrNilFunc
	}
	if ctx == nil {
		ctx = context.Background()
	}
	if err := ctx.Err(); err != nil {
		return zero, err
	}

	norm := cfg.normalized()
	var lastErr error

	for attempt := 1; attempt <= norm.MaxAttempts; attempt++ {
		if err := ctx.Err(); err != nil {
			return zero, err
		}

		res, err := fn(ctx)
		if err == nil {
			return res, nil
		}
		lastErr = err

		if ctxErr := ctx.Err(); ctxErr != nil {
			return zero, ctxErr
		}
		if attempt == norm.MaxAttempts {
			break
		}
		if norm.ShouldRetry != nil && !norm.ShouldRetry(err) {
			return zero, err
		}

		delay := ComputeDelay(attempt, norm)
		if sleepErr := norm.Sleep(ctx, delay); sleepErr != nil {
			return zero, sleepErr
		}
	}

	return zero, lastErr
}

func defaultSleep(ctx context.Context, d time.Duration) error {
	if d <= 0 {
		return ctx.Err()
	}
	timer := time.NewTimer(d)
	defer timer.Stop()

	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-timer.C:
		return nil
	}
}
