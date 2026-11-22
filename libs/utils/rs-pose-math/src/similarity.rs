//! Translation- and scale-invariant pose normalization and cosine similarity.

use std::collections::BTreeMap;

use crate::pose::{filter_by_confidence, Landmark, PoseFrame};
use crate::vector::{Vec3, VECTOR_EPSILON};

/// Normalizes a slice of landmarks into a flat, translation- and scale-invariant
/// unit-length feature vector `[x0, y0, z0, x1, y1, z1, ...]`.
///
/// Landmarks are centered by subtracting their mean centroid and divided by the
/// global L2 norm of all centered coordinates. Returns an empty vector if fewer
/// than 2 landmarks are provided or if all landmarks collapse to the same point.
fn normalize_landmarks(landmarks: &[Landmark]) -> Vec<f64> {
    if landmarks.len() < 2 {
        return Vec::new();
    }

    let count = landmarks.len() as f64;
    let mut sum = Vec3::zero();
    for lm in landmarks {
        sum = sum.add(lm.position);
    }
    let centroid = sum.scale(1.0 / count);

    let mut coords = Vec::with_capacity(landmarks.len() * 3);
    let mut norm_sq = 0.0_f64;
    for lm in landmarks {
        let centered = lm.position.sub(centroid);
        coords.push(centered.x);
        coords.push(centered.y);
        coords.push(centered.z);
        norm_sq += centered.norm_squared();
    }

    let norm = norm_sq.sqrt();
    if !norm.is_finite() || norm <= VECTOR_EPSILON {
        return Vec::new();
    }

    let inv_norm = 1.0 / norm;
    for value in &mut coords {
        *value *= inv_norm;
    }
    coords
}

/// Normalizes a [`PoseFrame`] into a deterministic, translation- and scale-invariant
/// unit-length feature vector `[x0, y0, z0, ...]`.
///
/// Only finite landmarks with `confidence >= min_confidence` are retained, sorted
/// in ascending order by [`Landmark::id`] (keeping the last entry if duplicate IDs
/// exist). Returns an empty `Vec` if fewer than 2 valid landmarks remain or if the
/// centered pose has zero spatial spread.
pub fn normalize_pose_frame(frame: &PoseFrame, min_confidence: f64) -> Vec<f64> {
    let filtered = filter_by_confidence(frame, min_confidence);
    let mut ordered = BTreeMap::new();
    for lm in filtered.landmarks {
        ordered.insert(lm.id, lm);
    }
    let sorted: Vec<Landmark> = ordered.into_values().collect();
    normalize_landmarks(&sorted)
}

/// Computes the cosine similarity between two flat feature vectors of equal length.
///
/// Returns `Some(similarity)` clamped to `[-1.0, 1.0]`, or `None` if the slices are
/// empty, differ in length, contain non-finite values, or either has near-zero norm.
pub fn cosine_similarity(a: &[f64], b: &[f64]) -> Option<f64> {
    if a.is_empty() || a.len() != b.len() {
        return None;
    }

    let mut dot = 0.0_f64;
    let mut norm_a_sq = 0.0_f64;
    let mut norm_b_sq = 0.0_f64;

    for (&x, &y) in a.iter().zip(b.iter()) {
        if !x.is_finite() || !y.is_finite() {
            return None;
        }
        dot += x * y;
        norm_a_sq += x * x;
        norm_b_sq += y * y;
    }

    let denom = norm_a_sq.sqrt() * norm_b_sq.sqrt();
    if !denom.is_finite() || denom <= VECTOR_EPSILON {
        return None;
    }

    Some((dot / denom).clamp(-1.0, 1.0))
}

/// Computes the translation- and scale-invariant cosine similarity between two
/// [`PoseFrame`]s using their shared valid landmarks (`confidence >= min_confidence`).
///
/// Landmarks are matched by [`Landmark::id`] in deterministic ascending order.
/// Returns `Some(similarity)` in `[-1.0, 1.0]`, or `None` if fewer than 2 shared
/// valid landmarks exist or either aligned pose is spatially degenerate.
pub fn pose_cosine_similarity(a: &PoseFrame, b: &PoseFrame, min_confidence: f64) -> Option<f64> {
    let filtered_a = filter_by_confidence(a, min_confidence);
    let filtered_b = filter_by_confidence(b, min_confidence);

    let map_a: BTreeMap<u32, Landmark> = filtered_a
        .landmarks
        .into_iter()
        .map(|lm| (lm.id, lm))
        .collect();
    let map_b: BTreeMap<u32, Landmark> = filtered_b
        .landmarks
        .into_iter()
        .map(|lm| (lm.id, lm))
        .collect();

    let mut aligned_a = Vec::new();
    let mut aligned_b = Vec::new();

    for (id, lm_a) in &map_a {
        if let Some(lm_b) = map_b.get(id) {
            aligned_a.push(*lm_a);
            aligned_b.push(*lm_b);
        }
    }

    let vec_a = normalize_landmarks(&aligned_a);
    let vec_b = normalize_landmarks(&aligned_b);
    cosine_similarity(&vec_a, &vec_b)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_pose(offset: Vec3, scale: f64) -> PoseFrame {
        PoseFrame::new(
            0.0,
            vec![
                Landmark::new(2, Vec3::new(0.0, 1.0, 0.0).scale(scale) + offset, 0.9),
                Landmark::new(0, Vec3::new(-1.0, 0.0, 0.0).scale(scale) + offset, 0.9),
                Landmark::new(1, Vec3::new(1.0, 0.0, 0.5).scale(scale) + offset, 0.9),
            ],
        )
    }

    #[test]
    fn normalize_pose_frame_is_unit_length_and_invariant() {
        let base = sample_pose(Vec3::zero(), 1.0);
        let shifted_scaled = sample_pose(Vec3::new(100.0, -50.0, 25.0), 3.5);

        let v1 = normalize_pose_frame(&base, 0.5);
        let v2 = normalize_pose_frame(&shifted_scaled, 0.5);
        assert_eq!(v1.len(), 9);
        assert_eq!(v2.len(), 9);

        let norm: f64 = v1.iter().map(|x| x * x).sum::<f64>().sqrt();
        assert!((norm - 1.0).abs() < 1e-12);

        for (a, b) in v1.iter().zip(v2.iter()) {
            assert!((a - b).abs() < 1e-12);
        }
    }

    #[test]
    fn pose_cosine_similarity_handles_identical_inverted_and_subset() {
        let base = sample_pose(Vec3::zero(), 1.0);
        let transformed = sample_pose(Vec3::new(5.0, -3.0, 2.0), 4.0);
        let sim = pose_cosine_similarity(&base, &transformed, 0.5).unwrap();
        assert!((sim - 1.0).abs() < 1e-12);

        let inverted = sample_pose(Vec3::zero(), -1.0);
        let opp_sim = pose_cosine_similarity(&base, &inverted, 0.5).unwrap();
        assert!((opp_sim + 1.0).abs() < 1e-12);
    }

    #[test]
    fn similarity_edge_cases_return_none_or_empty() {
        let single = PoseFrame::new(0.0, vec![Landmark::new(0, Vec3::new(1.0, 2.0, 3.0), 1.0)]);
        assert!(normalize_pose_frame(&single, 0.5).is_empty());

        let collapsed = PoseFrame::new(
            0.0,
            vec![
                Landmark::new(0, Vec3::new(1.0, 1.0, 1.0), 1.0),
                Landmark::new(1, Vec3::new(1.0, 1.0, 1.0), 1.0),
            ],
        );
        assert!(normalize_pose_frame(&collapsed, 0.5).is_empty());
        assert_eq!(pose_cosine_similarity(&single, &collapsed, 0.5), None);

        assert_eq!(cosine_similarity(&[], &[]), None);
        assert_eq!(cosine_similarity(&[1.0], &[1.0, 2.0]), None);
        assert_eq!(cosine_similarity(&[f64::NAN], &[1.0]), None);
        assert_eq!(cosine_similarity(&[0.0, 0.0], &[1.0, 0.0]), None);
    }
}
