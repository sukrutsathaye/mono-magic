//! Temporal smoothing filters for noisy pose streams (`EmaFilter`, `OneEuroFilter`, `PoseSmoother`).

use std::collections::BTreeMap;
use std::f64::consts::PI;
use std::fmt;

use crate::pose::{Landmark, PoseFrame};
use crate::vector::Vec3;

/// Errors returned when constructing or updating temporal smoothing filters.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FilterError {
    /// EMA smoothing factor `alpha` must be finite and in `(0.0, 1.0]`.
    InvalidAlpha,
    /// One Euro `min_cutoff` frequency must be finite and strictly positive.
    InvalidMinCutoff,
    /// One Euro `beta` speed coefficient must be finite and non-negative.
    InvalidBeta,
    /// One Euro derivative cutoff `d_cutoff` must be finite and strictly positive.
    InvalidDCutoff,
    /// Input sample value or timestamp was `NaN` or infinite.
    NonFiniteInput,
    /// Sample timestamp was less than or equal to the previous sample timestamp.
    NonMonotonicTimestamp,
}

impl fmt::Display for FilterError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidAlpha => write!(f, "EMA alpha must be finite and in (0.0, 1.0]"),
            Self::InvalidMinCutoff => write!(f, "OneEuro min_cutoff must be finite and > 0.0"),
            Self::InvalidBeta => write!(f, "OneEuro beta must be finite and >= 0.0"),
            Self::InvalidDCutoff => write!(f, "OneEuro d_cutoff must be finite and > 0.0"),
            Self::NonFiniteInput => write!(f, "filter input value and timestamp must be finite"),
            Self::NonMonotonicTimestamp => {
                write!(f, "timestamp must be strictly greater than previous sample")
            }
        }
    }
}

impl std::error::Error for FilterError {}

/// Single-channel Exponential Moving Average (EMA) low-pass filter.
///
/// Updates state via `y_t = alpha * x_t + (1 - alpha) * y_{t-1}`.
#[derive(Debug, Clone)]
pub struct EmaFilter {
    alpha: f64,
    state: Option<f64>,
}

impl EmaFilter {
    /// Creates a new EMA filter with smoothing factor `alpha` in `(0.0, 1.0]`.
    ///
    /// Higher `alpha` tracks rapid changes closely; lower `alpha` increases smoothing.
    pub fn new(alpha: f64) -> Result<Self, FilterError> {
        if !alpha.is_finite() || alpha <= 0.0 || alpha > 1.0 {
            return Err(FilterError::InvalidAlpha);
        }
        Ok(Self { alpha, state: None })
    }

    /// Returns the configured smoothing factor `alpha`.
    #[inline]
    pub const fn alpha(&self) -> f64 {
        self.alpha
    }

    /// Returns the most recent filtered value, if any sample has been processed.
    #[inline]
    pub const fn current(&self) -> Option<f64> {
        self.state
    }

    /// Clears internal filter state so the next sample re-initializes the filter.
    #[inline]
    pub fn reset(&mut self) {
        self.state = None;
    }

    /// Feeds a new sample into the filter and returns the smoothed value.
    ///
    /// Returns `None` without mutating state if `value` is non-finite.
    pub fn filter(&mut self, value: f64) -> Option<f64> {
        if !value.is_finite() {
            return None;
        }
        let next = match self.state {
            Some(prev) => self.alpha * value + (1.0 - self.alpha) * prev,
            None => value,
        };
        self.state = Some(next);
        Some(next)
    }
}

/// Computes the discrete low-pass smoothing factor `alpha` for time step `dt`
/// and cutoff frequency `cutoff` (Hz) as defined in Casiez et al. (CHI 2012).
#[inline]
fn smoothing_factor(dt: f64, cutoff: f64) -> f64 {
    let r = 2.0 * PI * cutoff * dt;
    r / (r + 1.0)
}

#[inline]
fn exponential_smoothing(alpha: f64, value: f64, prev: f64) -> f64 {
    alpha * value + (1.0 - alpha) * prev
}

/// Adaptive 1€ (One Euro) low-pass filter (Casiez, Roussel & Vogel, CHI 2012).
///
/// Reduces jitter at low velocities using `min_cutoff` while minimizing lag during
/// fast motion by dynamically raising the cutoff frequency proportionally to `beta`.
#[derive(Debug, Clone)]
pub struct OneEuroFilter {
    min_cutoff: f64,
    beta: f64,
    d_cutoff: f64,
    x_prev: Option<f64>,
    dx_prev: f64,
    t_prev: Option<f64>,
}

impl OneEuroFilter {
    /// Creates a new One Euro filter.
    ///
    /// - `min_cutoff`: minimum cutoff frequency in Hz (`> 0.0`, e.g. `1.0`).
    /// - `beta`: speed coefficient (`>= 0.0`, e.g. `0.007`).
    /// - `d_cutoff`: derivative cutoff frequency in Hz (`> 0.0`, typically `1.0`).
    pub fn new(min_cutoff: f64, beta: f64, d_cutoff: f64) -> Result<Self, FilterError> {
        if !min_cutoff.is_finite() || min_cutoff <= 0.0 {
            return Err(FilterError::InvalidMinCutoff);
        }
        if !beta.is_finite() || beta < 0.0 {
            return Err(FilterError::InvalidBeta);
        }
        if !d_cutoff.is_finite() || d_cutoff <= 0.0 {
            return Err(FilterError::InvalidDCutoff);
        }
        Ok(Self {
            min_cutoff,
            beta,
            d_cutoff,
            x_prev: None,
            dx_prev: 0.0,
            t_prev: None,
        })
    }

    /// Resets internal filter state.
    pub fn reset(&mut self) {
        self.x_prev = None;
        self.dx_prev = 0.0;
        self.t_prev = None;
    }

    /// Processes a new `(value, timestamp_secs)` sample and returns the filtered value.
    ///
    /// The first valid sample initializes the filter directly. Subsequent calls must
    /// supply strictly increasing `timestamp_secs`.
    pub fn filter(&mut self, value: f64, timestamp_secs: f64) -> Result<f64, FilterError> {
        if !value.is_finite() || !timestamp_secs.is_finite() {
            return Err(FilterError::NonFiniteInput);
        }

        let (Some(x_prev), Some(t_prev)) = (self.x_prev, self.t_prev) else {
            self.x_prev = Some(value);
            self.dx_prev = 0.0;
            self.t_prev = Some(timestamp_secs);
            return Ok(value);
        };

        let dt = timestamp_secs - t_prev;
        if dt <= 0.0 {
            return Err(FilterError::NonMonotonicTimestamp);
        }

        let a_d = smoothing_factor(dt, self.d_cutoff);
        let dx = (value - x_prev) / dt;
        let dx_hat = exponential_smoothing(a_d, dx, self.dx_prev);

        let cutoff = self.min_cutoff + self.beta * dx_hat.abs();
        let a = smoothing_factor(dt, cutoff);
        let x_hat = exponential_smoothing(a, value, x_prev);

        self.x_prev = Some(x_hat);
        self.dx_prev = dx_hat;
        self.t_prev = Some(timestamp_secs);

        Ok(x_hat)
    }
}

/// Stateful per-landmark 3D pose smoother backed by independent [`OneEuroFilter`] instances
/// for each landmark's `(x, y, z)` coordinates.
#[derive(Debug, Clone)]
pub struct PoseSmoother {
    min_cutoff: f64,
    beta: f64,
    d_cutoff: f64,
    filters: BTreeMap<u32, [OneEuroFilter; 3]>,
}

impl PoseSmoother {
    /// Creates a new [`PoseSmoother`] with the given One Euro filter parameters.
    pub fn new(min_cutoff: f64, beta: f64, d_cutoff: f64) -> Result<Self, FilterError> {
        // Validate parameters immediately by constructing a probe filter.
        let _ = OneEuroFilter::new(min_cutoff, beta, d_cutoff)?;
        Ok(Self {
            min_cutoff,
            beta,
            d_cutoff,
            filters: BTreeMap::new(),
        })
    }

    /// Clears all per-landmark filter histories.
    pub fn reset(&mut self) {
        self.filters.clear();
    }

    /// Smooths a [`PoseFrame`] and returns a new [`PoseFrame`] with filtered 3D coordinates.
    pub fn smooth(&mut self, frame: &PoseFrame) -> Result<PoseFrame, FilterError> {
        if !frame.timestamp_secs.is_finite() {
            return Err(FilterError::NonFiniteInput);
        }

        let mut smoothed_landmarks = Vec::with_capacity(frame.landmarks.len());
        for lm in &frame.landmarks {
            let entry = self.filters.entry(lm.id).or_insert_with(|| {
                // Parameters were validated in `PoseSmoother::new`.
                [
                    OneEuroFilter::new(self.min_cutoff, self.beta, self.d_cutoff)
                        .expect("validated parameters"),
                    OneEuroFilter::new(self.min_cutoff, self.beta, self.d_cutoff)
                        .expect("validated parameters"),
                    OneEuroFilter::new(self.min_cutoff, self.beta, self.d_cutoff)
                        .expect("validated parameters"),
                ]
            });

            let x = entry[0].filter(lm.position.x, frame.timestamp_secs)?;
            let y = entry[1].filter(lm.position.y, frame.timestamp_secs)?;
            let z = entry[2].filter(lm.position.z, frame.timestamp_secs)?;

            smoothed_landmarks.push(Landmark::new(lm.id, Vec3::new(x, y, z), lm.confidence));
        }

        Ok(PoseFrame::new(frame.timestamp_secs, smoothed_landmarks))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ema_filter_validation_and_convergence() {
        assert_eq!(EmaFilter::new(0.0).unwrap_err(), FilterError::InvalidAlpha);
        assert_eq!(EmaFilter::new(-0.1).unwrap_err(), FilterError::InvalidAlpha);
        assert_eq!(EmaFilter::new(1.5).unwrap_err(), FilterError::InvalidAlpha);
        assert_eq!(
            EmaFilter::new(f64::NAN).unwrap_err(),
            FilterError::InvalidAlpha
        );

        let mut ema = EmaFilter::new(0.25).unwrap();
        assert_eq!(ema.alpha(), 0.25);
        assert_eq!(ema.current(), None);
        assert_eq!(ema.filter(f64::NAN), None);
        assert_eq!(ema.filter(0.0), Some(0.0));
        assert_eq!(ema.filter(4.0), Some(1.0));
        assert_eq!(ema.current(), Some(1.0));

        // Converges toward constant target 10.0.
        let mut last = 0.0;
        for _ in 0..50 {
            last = ema.filter(10.0).unwrap();
        }
        assert!((last - 10.0).abs() < 1e-4);

        ema.reset();
        assert_eq!(ema.current(), None);
    }

    #[test]
    fn one_euro_filter_validation_and_jitter_reduction() {
        assert_eq!(
            OneEuroFilter::new(0.0, 0.0, 1.0).unwrap_err(),
            FilterError::InvalidMinCutoff
        );
        assert_eq!(
            OneEuroFilter::new(1.0, -0.1, 1.0).unwrap_err(),
            FilterError::InvalidBeta
        );
        assert_eq!(
            OneEuroFilter::new(1.0, 0.0, 0.0).unwrap_err(),
            FilterError::InvalidDCutoff
        );

        let mut filter = OneEuroFilter::new(1.0, 0.01, 1.0).unwrap();
        assert_eq!(
            filter.filter(f64::NAN, 0.0).unwrap_err(),
            FilterError::NonFiniteInput
        );
        assert_eq!(filter.filter(1.0, 0.0).unwrap(), 1.0);
        assert_eq!(
            filter.filter(1.0, 0.0).unwrap_err(),
            FilterError::NonMonotonicTimestamp
        );

        // Alternating +/-0.1 jitter around 1.0 at 60 Hz should be damped.
        let mut max_dev = 0.0_f64;
        for i in 1..=60 {
            let t = i as f64 / 60.0;
            let raw = 1.0 + if i % 2 == 0 { 0.1 } else { -0.1 };
            let filtered = filter.filter(raw, t).unwrap();
            if i > 10 {
                max_dev = max_dev.max((filtered - 1.0).abs());
            }
        }
        assert!(max_dev < 0.05, "expected jitter damping, got {max_dev}");

        filter.reset();
        assert_eq!(filter.filter(5.0, 0.0).unwrap(), 5.0);
    }

    #[test]
    fn pose_smoother_tracks_multi_landmark_frames() {
        let mut smoother = PoseSmoother::new(1.0, 0.05, 1.0).unwrap();
        let f0 = PoseFrame::new(
            0.0,
            vec![
                Landmark::new(0, Vec3::new(0.0, 0.0, 0.0), 0.9),
                Landmark::new(1, Vec3::new(1.0, 2.0, 3.0), 0.95),
            ],
        );
        let out0 = smoother.smooth(&f0).unwrap();
        assert_eq!(out0, f0);

        let f1 = PoseFrame::new(
            0.033,
            vec![
                Landmark::new(0, Vec3::new(1.0, 0.0, 0.0), 0.9),
                Landmark::new(1, Vec3::new(1.0, 2.0, 4.0), 0.95),
            ],
        );
        let out1 = smoother.smooth(&f1).unwrap();
        assert!(out1.landmarks[0].position.x > 0.0 && out1.landmarks[0].position.x < 1.0);
        assert!(out1.landmarks[1].position.z > 3.0 && out1.landmarks[1].position.z < 4.0);

        smoother.reset();
        let bad = PoseFrame::new(f64::NAN, vec![]);
        assert_eq!(
            smoother.smooth(&bad).unwrap_err(),
            FilterError::NonFiniteInput
        );
    }

    #[test]
    fn filter_error_display_messages() {
        let errors = [
            FilterError::InvalidAlpha,
            FilterError::InvalidMinCutoff,
            FilterError::InvalidBeta,
            FilterError::InvalidDCutoff,
            FilterError::NonFiniteInput,
            FilterError::NonMonotonicTimestamp,
        ];
        for err in errors {
            assert!(!err.to_string().is_empty());
        }
    }
}
