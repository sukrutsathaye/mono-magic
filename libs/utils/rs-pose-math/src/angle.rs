//! 2D and 3D joint angle calculation between three points or landmarks.

use crate::pose::Landmark;
use crate::vector::{Vec2, Vec3};

/// Computes the interior angle in radians at vertex `b` formed by rays `b -> a` and `b -> c` in 2D.
///
/// The returned angle is in `[0.0, PI]`. Returns `None` if any coordinate is non-finite
/// or if either limb (`b -> a` or `b -> c`) has near-zero length.
pub fn joint_angle_2d_rad(a: Vec2, b: Vec2, c: Vec2) -> Option<f64> {
    let ba = a.sub(b).normalize()?;
    let bc = c.sub(b).normalize()?;
    let cos_theta = ba.dot(bc).clamp(-1.0, 1.0);
    Some(cos_theta.acos())
}

/// Computes the interior angle in degrees at vertex `b` formed by rays `b -> a` and `b -> c` in 2D.
///
/// The returned angle is in `[0.0, 180.0]`. Returns `None` for degenerate or non-finite inputs.
#[inline]
pub fn joint_angle_2d_deg(a: Vec2, b: Vec2, c: Vec2) -> Option<f64> {
    joint_angle_2d_rad(a, b, c).map(f64::to_degrees)
}

/// Computes the interior angle in radians at vertex `b` formed by rays `b -> a` and `b -> c` in 3D.
///
/// The returned angle is in `[0.0, PI]`. Returns `None` if any coordinate is non-finite
/// or if either limb (`b -> a` or `b -> c`) has near-zero length.
pub fn joint_angle_3d_rad(a: Vec3, b: Vec3, c: Vec3) -> Option<f64> {
    let ba = a.sub(b).normalize()?;
    let bc = c.sub(b).normalize()?;
    let cos_theta = ba.dot(bc).clamp(-1.0, 1.0);
    Some(cos_theta.acos())
}

/// Computes the interior angle in degrees at vertex `b` formed by rays `b -> a` and `b -> c` in 3D.
///
/// The returned angle is in `[0.0, 180.0]`. Returns `None` for degenerate or non-finite inputs.
#[inline]
pub fn joint_angle_3d_deg(a: Vec3, b: Vec3, c: Vec3) -> Option<f64> {
    joint_angle_3d_rad(a, b, c).map(f64::to_degrees)
}

/// Computes the 2D (XY-plane) joint angle in degrees across three landmarks,
/// returning `None` if any landmark fails `min_confidence` or forms a degenerate limb.
pub fn landmark_angle_2d_deg(
    a: &Landmark,
    b: &Landmark,
    c: &Landmark,
    min_confidence: f64,
) -> Option<f64> {
    if !a.is_valid(min_confidence) || !b.is_valid(min_confidence) || !c.is_valid(min_confidence) {
        return None;
    }
    joint_angle_2d_deg(a.position.xy(), b.position.xy(), c.position.xy())
}

/// Computes the 3D joint angle in degrees across three landmarks,
/// returning `None` if any landmark fails `min_confidence` or forms a degenerate limb.
pub fn landmark_angle_3d_deg(
    a: &Landmark,
    b: &Landmark,
    c: &Landmark,
    min_confidence: f64,
) -> Option<f64> {
    if !a.is_valid(min_confidence) || !b.is_valid(min_confidence) || !c.is_valid(min_confidence) {
        return None;
    }
    joint_angle_3d_deg(a.position, b.position, c.position)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::f64::consts::FRAC_PI_2;

    #[test]
    fn joint_angle_2d_known_angles() {
        let origin = Vec2::zero();
        let right = Vec2::new(1.0, 0.0);
        let up = Vec2::new(0.0, 1.0);
        let left = Vec2::new(-2.0, 0.0);

        let right_angle = joint_angle_2d_deg(right, origin, up).unwrap();
        assert!((right_angle - 90.0).abs() < 1e-10);
        assert!((joint_angle_2d_rad(right, origin, up).unwrap() - FRAC_PI_2).abs() < 1e-10);

        let straight = joint_angle_2d_deg(right, origin, left).unwrap();
        assert!((straight - 180.0).abs() < 1e-10);

        let zero = joint_angle_2d_deg(right, origin, Vec2::new(5.0, 0.0)).unwrap();
        assert!(zero.abs() < 1e-10);
    }

    #[test]
    fn joint_angle_3d_known_angles() {
        let b = Vec3::new(1.0, 1.0, 1.0);
        let a = Vec3::new(2.0, 1.0, 1.0);
        let c = Vec3::new(1.0, 1.0, 2.0);
        let deg = joint_angle_3d_deg(a, b, c).unwrap();
        assert!((deg - 90.0).abs() < 1e-10);

        let opp = Vec3::new(0.0, 1.0, 1.0);
        assert!((joint_angle_3d_deg(a, b, opp).unwrap() - 180.0).abs() < 1e-10);
    }

    #[test]
    fn degenerate_and_low_confidence_return_none() {
        let p = Vec2::new(1.0, 1.0);
        assert_eq!(joint_angle_2d_rad(p, p, Vec2::new(2.0, 1.0)), None);
        assert_eq!(
            joint_angle_3d_rad(Vec3::zero(), Vec3::zero(), Vec3::new(1.0, 0.0, 0.0)),
            None
        );
        assert_eq!(
            joint_angle_2d_deg(Vec2::new(f64::NAN, 0.0), Vec2::zero(), Vec2::new(1.0, 0.0)),
            None
        );

        let a = Landmark::new(0, Vec3::new(1.0, 0.0, 0.0), 0.9);
        let b = Landmark::new(1, Vec3::zero(), 0.9);
        let c = Landmark::new(2, Vec3::new(0.0, 1.0, 0.0), 0.4);
        assert_eq!(landmark_angle_3d_deg(&a, &b, &c, 0.5), None);
        assert_eq!(landmark_angle_2d_deg(&a, &b, &c, 0.5), None);
        assert!((landmark_angle_3d_deg(&a, &b, &c, 0.3).unwrap() - 90.0).abs() < 1e-10);
        assert!((landmark_angle_2d_deg(&a, &b, &c, 0.3).unwrap() - 90.0).abs() < 1e-10);
    }
}
