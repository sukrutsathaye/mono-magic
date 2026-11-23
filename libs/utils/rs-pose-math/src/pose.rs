//! Pose landmark and frame representations with confidence filtering.

use crate::vector::Vec3;

/// A single tracked skeletal landmark in 3D space with an associated detection confidence.
#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Landmark {
    /// Stable anatomical landmark identifier (e.g. MediaPipe/MoveNet index).
    pub id: u32,
    /// 3D spatial position `(x, y, z)`.
    pub position: Vec3,
    /// Detection confidence score, typically in `[0.0, 1.0]`.
    pub confidence: f64,
}

impl Landmark {
    /// Creates a new landmark.
    #[inline]
    pub const fn new(id: u32, position: Vec3, confidence: f64) -> Self {
        Self {
            id,
            position,
            confidence,
        }
    }

    /// Returns `true` if the landmark has finite coordinates, a finite confidence
    /// score, and `confidence >= min_confidence`.
    #[inline]
    pub fn is_valid(&self, min_confidence: f64) -> bool {
        min_confidence.is_finite()
            && self.confidence.is_finite()
            && self.confidence >= min_confidence
            && self.position.is_finite()
    }
}

/// A timestamped collection of skeletal landmarks representing a single pose observation.
#[derive(Debug, Clone, PartialEq)]
pub struct PoseFrame {
    /// Capture timestamp in seconds.
    pub timestamp_secs: f64,
    /// Observed landmarks for this frame.
    pub landmarks: Vec<Landmark>,
}

impl PoseFrame {
    /// Creates a new pose frame.
    #[inline]
    pub fn new(timestamp_secs: f64, landmarks: Vec<Landmark>) -> Self {
        Self {
            timestamp_secs,
            landmarks,
        }
    }

    /// Looks up the first landmark matching `id`.
    #[inline]
    pub fn landmark_by_id(&self, id: u32) -> Option<&Landmark> {
        self.landmarks.iter().find(|lm| lm.id == id)
    }
}

/// Returns a new [`PoseFrame`] containing only landmarks whose coordinates and
/// confidence are finite and satisfy `confidence >= min_confidence`.
///
/// The input `frame` is not mutated. If `min_confidence` is non-finite (`NaN` or
/// infinite), an empty landmark list is returned.
pub fn filter_by_confidence(frame: &PoseFrame, min_confidence: f64) -> PoseFrame {
    let landmarks = if min_confidence.is_finite() {
        frame
            .landmarks
            .iter()
            .copied()
            .filter(|lm| lm.is_valid(min_confidence))
            .collect()
    } else {
        Vec::new()
    };

    PoseFrame {
        timestamp_secs: frame.timestamp_secs,
        landmarks,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn filter_by_confidence_excludes_low_and_non_finite() {
        let frame = PoseFrame::new(
            1.5,
            vec![
                Landmark::new(0, Vec3::new(0.0, 0.0, 0.0), 0.95),
                Landmark::new(1, Vec3::new(1.0, 0.0, 0.0), 0.50),
                Landmark::new(2, Vec3::new(2.0, 0.0, 0.0), 0.20),
                Landmark::new(3, Vec3::new(f64::NAN, 0.0, 0.0), 0.99),
                Landmark::new(4, Vec3::new(3.0, 0.0, 0.0), f64::NAN),
            ],
        );

        let filtered = filter_by_confidence(&frame, 0.5);
        assert_eq!(filtered.timestamp_secs, 1.5);
        assert_eq!(filtered.landmarks.len(), 2);
        assert_eq!(filtered.landmarks[0].id, 0);
        assert_eq!(filtered.landmarks[1].id, 1);
        assert_eq!(filtered.landmark_by_id(1).unwrap().confidence, 0.5);
        assert!(filtered.landmark_by_id(2).is_none());
    }

    #[test]
    fn filter_by_confidence_handles_nan_threshold() {
        let frame = PoseFrame::new(0.0, vec![Landmark::new(0, Vec3::zero(), 1.0)]);
        let filtered = filter_by_confidence(&frame, f64::NAN);
        assert!(filtered.landmarks.is_empty());
    }
}
