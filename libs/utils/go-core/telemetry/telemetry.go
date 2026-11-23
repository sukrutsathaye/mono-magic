// Package telemetry provides thread-safe in-memory telemetry primitives:
// a generic fixed-capacity RingBuffer and a time-bounded SlidingWindow
// numeric aggregator.
package telemetry

import (
	"math"
	"slices"
	"sync"
	"time"
)

// RingBuffer is a thread-safe, fixed-capacity FIFO circular buffer.
// When full, Push overwrites the oldest element.
type RingBuffer[T any] struct {
	mu    sync.RWMutex
	buf   []T
	head  int
	count int
}

// NewRingBuffer creates a RingBuffer with the given capacity.
// If capacity <= 0, the buffer has zero capacity and Push is a no-op.
func NewRingBuffer[T any](capacity int) *RingBuffer[T] {
	if capacity <= 0 {
		return &RingBuffer[T]{}
	}
	return &RingBuffer[T]{
		buf: make([]T, capacity),
	}
}

// Push appends value to the buffer, overwriting the oldest element if at capacity.
func (rb *RingBuffer[T]) Push(value T) {
	rb.mu.Lock()
	defer rb.mu.Unlock()

	if len(rb.buf) == 0 {
		return
	}
	if rb.count < len(rb.buf) {
		idx := (rb.head + rb.count) % len(rb.buf)
		rb.buf[idx] = value
		rb.count++
		return
	}
	rb.buf[rb.head] = value
	rb.head = (rb.head + 1) % len(rb.buf)
}

// Len returns the current number of stored elements.
func (rb *RingBuffer[T]) Len() int {
	rb.mu.RLock()
	defer rb.mu.RUnlock()
	return rb.count
}

// Cap returns the maximum capacity of the buffer.
func (rb *RingBuffer[T]) Cap() int {
	rb.mu.RLock()
	defer rb.mu.RUnlock()
	return len(rb.buf)
}

// Snapshot returns a newly allocated slice containing all buffered elements
// ordered from oldest to newest.
func (rb *RingBuffer[T]) Snapshot() []T {
	rb.mu.RLock()
	defer rb.mu.RUnlock()

	out := make([]T, rb.count)
	for i := 0; i < rb.count; i++ {
		out[i] = rb.buf[(rb.head+i)%len(rb.buf)]
	}
	return out
}

// Reset removes all elements from the buffer and zeroes backing storage so
// referenced objects can be garbage-collected.
func (rb *RingBuffer[T]) Reset() {
	rb.mu.Lock()
	defer rb.mu.Unlock()

	clear(rb.buf)
	rb.head = 0
	rb.count = 0
}

// WindowStats holds summary statistics for samples within a SlidingWindow.
type WindowStats struct {
	Count int
	Sum   float64
	Min   float64
	Max   float64
	Mean  float64
	// P95 is the 95th percentile computed via the nearest-rank method.
	P95 float64
}

type sample struct {
	ts    time.Time
	value float64
}

// SlidingWindow is a thread-safe numeric aggregator that tracks samples over
// a moving time window and evicts expired samples outside windowDuration.
type SlidingWindow struct {
	mu             sync.Mutex
	windowDuration time.Duration
	samples        []sample
}

// NewSlidingWindow creates a SlidingWindow retaining samples within windowDuration
// of the query timestamp. Negative durations are clamped to 0.
func NewSlidingWindow(windowDuration time.Duration) *SlidingWindow {
	if windowDuration < 0 {
		windowDuration = 0
	}
	return &SlidingWindow{
		windowDuration: windowDuration,
	}
}

// Add records a numeric observation at timestamp ts.
func (w *SlidingWindow) Add(ts time.Time, value float64) {
	w.mu.Lock()
	defer w.mu.Unlock()

	w.samples = append(w.samples, sample{ts: ts, value: value})
}

// Stats evicts samples older than now.Add(-windowDuration) and computes summary
// statistics over all remaining samples. Returns a zero WindowStats if empty.
func (w *SlidingWindow) Stats(now time.Time) WindowStats {
	w.mu.Lock()
	defer w.mu.Unlock()

	cutoff := now.Add(-w.windowDuration)
	w.evictBeforeLocked(cutoff)

	n := len(w.samples)
	if n == 0 {
		return WindowStats{}
	}

	values := make([]float64, n)
	var sum float64
	minVal := w.samples[0].value
	maxVal := w.samples[0].value

	for i, s := range w.samples {
		v := s.value
		values[i] = v
		sum += v
		if v < minVal {
			minVal = v
		}
		if v > maxVal {
			maxVal = v
		}
	}

	slices.Sort(values)
	p95Idx := int(math.Ceil(0.95*float64(n))) - 1
	if p95Idx < 0 {
		p95Idx = 0
	} else if p95Idx >= n {
		p95Idx = n - 1
	}

	return WindowStats{
		Count: n,
		Sum:   sum,
		Min:   minVal,
		Max:   maxVal,
		Mean:  sum / float64(n),
		P95:   values[p95Idx],
	}
}

// Reset removes all recorded samples from the window.
func (w *SlidingWindow) Reset() {
	w.mu.Lock()
	defer w.mu.Unlock()

	w.samples = nil
}

func (w *SlidingWindow) evictBeforeLocked(cutoff time.Time) {
	kept := w.samples[:0]
	for _, s := range w.samples {
		if !s.ts.Before(cutoff) {
			kept = append(kept, s)
		}
	}
	// Clear trailing references before reslicing.
	clear(w.samples[len(kept):])
	w.samples = kept
}
