package telemetry_test

import (
	"math"
	"slices"
	"sync"
	"testing"
	"time"

	"github.com/sukrutsathaye/mono-magic/libs/utils/go-core/telemetry"
)

func TestRingBufferBasicAndWrapAround(t *testing.T) {
	t.Parallel()

	rb := telemetry.NewRingBuffer[int](3)
	if rb.Cap() != 3 || rb.Len() != 0 {
		t.Fatalf("initial Cap/Len = (%d, %d), want (3, 0)", rb.Cap(), rb.Len())
	}

	rb.Push(10)
	rb.Push(20)
	if got := rb.Snapshot(); !slices.Equal(got, []int{10, 20}) {
		t.Fatalf("Snapshot() = %v, want [10 20]", got)
	}

	rb.Push(30)
	rb.Push(40) // overwrites 10
	rb.Push(50) // overwrites 20
	if rb.Len() != 3 {
		t.Fatalf("Len() = %d, want 3", rb.Len())
	}
	snap := rb.Snapshot()
	if !slices.Equal(snap, []int{30, 40, 50}) {
		t.Fatalf("Snapshot() = %v, want [30 40 50]", snap)
	}

	// Mutating snapshot must not affect buffer.
	snap[0] = 999
	if got := rb.Snapshot(); !slices.Equal(got, []int{30, 40, 50}) {
		t.Fatalf("buffer mutated via snapshot: %v", got)
	}

	rb.Reset()
	if rb.Len() != 0 || len(rb.Snapshot()) != 0 {
		t.Fatalf("expected empty buffer after Reset, Len=%d", rb.Len())
	}
}

func TestRingBufferZeroCapacity(t *testing.T) {
	t.Parallel()

	rb := telemetry.NewRingBuffer[string](-5)
	if rb.Cap() != 0 || rb.Len() != 0 {
		t.Fatalf("Cap/Len = (%d, %d), want (0, 0)", rb.Cap(), rb.Len())
	}
	rb.Push("ignored")
	if rb.Len() != 0 || len(rb.Snapshot()) != 0 {
		t.Fatalf("expected no-op Push on zero-capacity RingBuffer")
	}
}

func TestRingBufferConcurrentRace(t *testing.T) {
	t.Parallel()

	rb := telemetry.NewRingBuffer[int](32)
	var wg sync.WaitGroup

	for w := 0; w < 8; w++ {
		wg.Add(1)
		go func(base int) {
			defer wg.Done()
			for i := 0; i < 200; i++ {
				rb.Push(base*1000 + i)
				_ = rb.Len()
				_ = rb.Cap()
				_ = rb.Snapshot()
			}
		}(w)
	}
	wg.Add(1)
	go func() {
		defer wg.Done()
		for i := 0; i < 20; i++ {
			rb.Reset()
		}
	}()

	wg.Wait()
	if rb.Len() > rb.Cap() {
		t.Fatalf("Len(%d) exceeded Cap(%d)", rb.Len(), rb.Cap())
	}
}

func TestSlidingWindowStatsAndEviction(t *testing.T) {
	t.Parallel()

	base := time.Date(2026, 11, 22, 12, 0, 0, 0, time.UTC)
	sw := telemetry.NewSlidingWindow(10 * time.Second)

	if empty := sw.Stats(base); empty != (telemetry.WindowStats{}) {
		t.Fatalf("expected zero stats for empty window, got %+v", empty)
	}

	// Add 20 values: 1..20, with two expired samples before base-10s.
	sw.Add(base.Add(-15*time.Second), 9999)
	sw.Add(base.Add(-11*time.Second), -9999)
	for i := 1; i <= 20; i++ {
		sw.Add(base.Add(-time.Duration(20-i)*400*time.Millisecond), float64(i))
	}

	stats := sw.Stats(base)
	if stats.Count != 20 {
		t.Fatalf("Count = %d, want 20", stats.Count)
	}
	if stats.Sum != 210 {
		t.Errorf("Sum = %v, want 210", stats.Sum)
	}
	if stats.Min != 1 {
		t.Errorf("Min = %v, want 1", stats.Min)
	}
	if stats.Max != 20 {
		t.Errorf("Max = %v, want 20", stats.Max)
	}
	if math.Abs(stats.Mean-10.5) > 1e-9 {
		t.Errorf("Mean = %v, want 10.5", stats.Mean)
	}
	// Nearest-rank P95 of 1..20: ceil(0.95*20) = 19 -> value 19.
	if stats.P95 != 19 {
		t.Errorf("P95 = %v, want 19", stats.P95)
	}

	// Advancing time far into the future evicts all samples.
	later := sw.Stats(base.Add(time.Minute))
	if later.Count != 0 {
		t.Fatalf("expected all samples evicted, got Count=%d", later.Count)
	}
}

func TestSlidingWindowNegativeDurationAndReset(t *testing.T) {
	t.Parallel()

	now := time.Now()
	sw := telemetry.NewSlidingWindow(-5 * time.Second)
	sw.Add(now, 42.5)
	stats := sw.Stats(now)
	if stats.Count != 1 || stats.P95 != 42.5 || stats.Mean != 42.5 {
		t.Fatalf("unexpected stats for single sample: %+v", stats)
	}

	sw.Reset()
	if after := sw.Stats(now); after.Count != 0 {
		t.Fatalf("expected empty window after Reset, got %+v", after)
	}
}

func TestSlidingWindowConcurrentRace(t *testing.T) {
	t.Parallel()

	base := time.Now()
	sw := telemetry.NewSlidingWindow(5 * time.Second)
	var wg sync.WaitGroup

	for w := 0; w < 8; w++ {
		wg.Add(1)
		go func(worker int) {
			defer wg.Done()
			for i := 0; i < 100; i++ {
				ts := base.Add(time.Duration(i) * 10 * time.Millisecond)
				sw.Add(ts, float64(worker*100+i))
				_ = sw.Stats(ts)
			}
		}(w)
	}
	wg.Add(1)
	go func() {
		defer wg.Done()
		for i := 0; i < 10; i++ {
			sw.Reset()
		}
	}()

	wg.Wait()
}
