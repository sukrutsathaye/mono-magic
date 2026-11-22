//! 2D and 3D Euclidean vector primitives with `#[repr(C)]` FFI/WASM-ready layout.

use std::ops::{Add, Mul, Neg, Sub};

/// Epsilon threshold below which vector norms are treated as degenerate (zero).
pub const VECTOR_EPSILON: f64 = 1e-12;

/// A 2D Euclidean vector with `f64` coordinates and C-compatible memory layout.
#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct Vec2 {
    /// Horizontal coordinate.
    pub x: f64,
    /// Vertical coordinate.
    pub y: f64,
}

impl Vec2 {
    /// Creates a new 2D vector from `(x, y)` coordinates.
    #[inline]
    pub const fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }

    /// Returns the zero vector `(0.0, 0.0)`.
    #[inline]
    pub const fn zero() -> Self {
        Self { x: 0.0, y: 0.0 }
    }

    /// Returns `true` if all components are finite (neither `NaN` nor infinite).
    #[inline]
    pub fn is_finite(self) -> bool {
        self.x.is_finite() && self.y.is_finite()
    }

    /// Returns the component-wise sum `self + other`.
    #[inline]
    #[allow(clippy::should_implement_trait)]
    pub fn add(self, other: Self) -> Self {
        Self {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }

    /// Returns the component-wise difference `self - other`.
    #[inline]
    #[allow(clippy::should_implement_trait)]
    pub fn sub(self, other: Self) -> Self {
        Self {
            x: self.x - other.x,
            y: self.y - other.y,
        }
    }

    /// Scales each component by `scalar`.
    #[inline]
    pub fn scale(self, scalar: f64) -> Self {
        Self {
            x: self.x * scalar,
            y: self.y * scalar,
        }
    }

    /// Computes the Euclidean dot product `self · other`.
    #[inline]
    pub fn dot(self, other: Self) -> f64 {
        self.x * other.x + self.y * other.y
    }

    /// Computes the squared Euclidean norm `||self||^2`.
    #[inline]
    pub fn norm_squared(self) -> f64 {
        self.dot(self)
    }

    /// Computes the Euclidean norm (magnitude) `||self||`.
    #[inline]
    pub fn norm(self) -> f64 {
        self.norm_squared().sqrt()
    }

    /// Returns a unit vector in the direction of `self`, or `None` if the vector
    /// has non-finite components or near-zero length (`<= VECTOR_EPSILON`).
    #[inline]
    pub fn normalize(self) -> Option<Self> {
        if !self.is_finite() {
            return None;
        }
        let n = self.norm();
        if !n.is_finite() || n <= VECTOR_EPSILON {
            return None;
        }
        Some(self.scale(1.0 / n))
    }

    /// Computes the Euclidean distance between `self` and `other`.
    #[inline]
    pub fn distance(self, other: Self) -> f64 {
        self.sub(other).norm()
    }
}

impl Add for Vec2 {
    type Output = Self;

    #[inline]
    fn add(self, rhs: Self) -> Self::Output {
        Self::add(self, rhs)
    }
}

impl Sub for Vec2 {
    type Output = Self;

    #[inline]
    fn sub(self, rhs: Self) -> Self::Output {
        Self::sub(self, rhs)
    }
}

impl Mul<f64> for Vec2 {
    type Output = Self;

    #[inline]
    fn mul(self, rhs: f64) -> Self::Output {
        self.scale(rhs)
    }
}

impl Neg for Vec2 {
    type Output = Self;

    #[inline]
    fn neg(self) -> Self::Output {
        Self::new(-self.x, -self.y)
    }
}

/// A 3D Euclidean vector with `f64` coordinates and C-compatible memory layout.
#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct Vec3 {
    /// X coordinate.
    pub x: f64,
    /// Y coordinate.
    pub y: f64,
    /// Z coordinate (depth).
    pub z: f64,
}

impl Vec3 {
    /// Creates a new 3D vector from `(x, y, z)` coordinates.
    #[inline]
    pub const fn new(x: f64, y: f64, z: f64) -> Self {
        Self { x, y, z }
    }

    /// Returns the zero vector `(0.0, 0.0, 0.0)`.
    #[inline]
    pub const fn zero() -> Self {
        Self {
            x: 0.0,
            y: 0.0,
            z: 0.0,
        }
    }

    /// Projects this 3D vector onto the 2D XY plane.
    #[inline]
    pub const fn xy(self) -> Vec2 {
        Vec2::new(self.x, self.y)
    }

    /// Returns `true` if all components are finite (neither `NaN` nor infinite).
    #[inline]
    pub fn is_finite(self) -> bool {
        self.x.is_finite() && self.y.is_finite() && self.z.is_finite()
    }

    /// Returns the component-wise sum `self + other`.
    #[inline]
    #[allow(clippy::should_implement_trait)]
    pub fn add(self, other: Self) -> Self {
        Self {
            x: self.x + other.x,
            y: self.y + other.y,
            z: self.z + other.z,
        }
    }

    /// Returns the component-wise difference `self - other`.
    #[inline]
    #[allow(clippy::should_implement_trait)]
    pub fn sub(self, other: Self) -> Self {
        Self {
            x: self.x - other.x,
            y: self.y - other.y,
            z: self.z - other.z,
        }
    }

    /// Scales each component by `scalar`.
    #[inline]
    pub fn scale(self, scalar: f64) -> Self {
        Self {
            x: self.x * scalar,
            y: self.y * scalar,
            z: self.z * scalar,
        }
    }

    /// Computes the Euclidean dot product `self · other`.
    #[inline]
    pub fn dot(self, other: Self) -> f64 {
        self.x * other.x + self.y * other.y + self.z * other.z
    }

    /// Computes the 3D cross product `self × other`.
    #[inline]
    pub fn cross(self, other: Self) -> Self {
        Self {
            x: self.y * other.z - self.z * other.y,
            y: self.z * other.x - self.x * other.z,
            z: self.x * other.y - self.y * other.x,
        }
    }

    /// Computes the squared Euclidean norm `||self||^2`.
    #[inline]
    pub fn norm_squared(self) -> f64 {
        self.dot(self)
    }

    /// Computes the Euclidean norm (magnitude) `||self||`.
    #[inline]
    pub fn norm(self) -> f64 {
        self.norm_squared().sqrt()
    }

    /// Returns a unit vector in the direction of `self`, or `None` if the vector
    /// has non-finite components or near-zero length (`<= VECTOR_EPSILON`).
    #[inline]
    pub fn normalize(self) -> Option<Self> {
        if !self.is_finite() {
            return None;
        }
        let n = self.norm();
        if !n.is_finite() || n <= VECTOR_EPSILON {
            return None;
        }
        Some(self.scale(1.0 / n))
    }

    /// Computes the Euclidean distance between `self` and `other`.
    #[inline]
    pub fn distance(self, other: Self) -> f64 {
        self.sub(other).norm()
    }
}

impl Add for Vec3 {
    type Output = Self;

    #[inline]
    fn add(self, rhs: Self) -> Self::Output {
        Self::add(self, rhs)
    }
}

impl Sub for Vec3 {
    type Output = Self;

    #[inline]
    fn sub(self, rhs: Self) -> Self::Output {
        Self::sub(self, rhs)
    }
}

impl Mul<f64> for Vec3 {
    type Output = Self;

    #[inline]
    fn mul(self, rhs: f64) -> Self::Output {
        self.scale(rhs)
    }
}

impl Neg for Vec3 {
    type Output = Self;

    #[inline]
    fn neg(self) -> Self::Output {
        Self::new(-self.x, -self.y, -self.z)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn vec2_arithmetic_and_metrics() {
        let a = Vec2::new(3.0, 4.0);
        let b = Vec2::new(1.0, -2.0);
        assert_eq!(a + b, Vec2::new(4.0, 2.0));
        assert_eq!(a - b, Vec2::new(2.0, 6.0));
        assert_eq!(a * 2.0, Vec2::new(6.0, 8.0));
        assert_eq!(-a, Vec2::new(-3.0, -4.0));
        assert_eq!(a.dot(b), -5.0);
        assert!((a.norm() - 5.0).abs() < 1e-12);
        assert!((a.distance(Vec2::zero()) - 5.0).abs() < 1e-12);

        let unit = a.normalize().expect("non-zero vector normalizes");
        assert!((unit.norm() - 1.0).abs() < 1e-12);
        assert!((unit.x - 0.6).abs() < 1e-12);
        assert!((unit.y - 0.8).abs() < 1e-12);
    }

    #[test]
    fn vec2_degenerate_normalize_returns_none() {
        assert_eq!(Vec2::zero().normalize(), None);
        assert_eq!(Vec2::new(1e-15, -1e-15).normalize(), None);
        assert_eq!(Vec2::new(f64::NAN, 1.0).normalize(), None);
        assert_eq!(Vec2::new(f64::INFINITY, 1.0).normalize(), None);
    }

    #[test]
    fn vec3_arithmetic_cross_and_metrics() {
        let a = Vec3::new(1.0, 2.0, 3.0);
        let b = Vec3::new(4.0, 5.0, 6.0);
        assert_eq!(a + b, Vec3::new(5.0, 7.0, 9.0));
        assert_eq!(b - a, Vec3::new(3.0, 3.0, 3.0));
        assert_eq!(a * 3.0, Vec3::new(3.0, 6.0, 9.0));
        assert_eq!(-a, Vec3::new(-1.0, -2.0, -3.0));
        assert_eq!(a.dot(b), 32.0);
        assert_eq!(a.xy(), Vec2::new(1.0, 2.0));

        let x = Vec3::new(1.0, 0.0, 0.0);
        let y = Vec3::new(0.0, 1.0, 0.0);
        assert_eq!(x.cross(y), Vec3::new(0.0, 0.0, 1.0));

        let v = Vec3::new(2.0, 3.0, 6.0);
        assert!((v.norm() - 7.0).abs() < 1e-12);
        assert!((v.distance(Vec3::zero()) - 7.0).abs() < 1e-12);
        let unit = v.normalize().expect("non-zero vec3 normalizes");
        assert!((unit.norm() - 1.0).abs() < 1e-12);
    }

    #[test]
    fn vec3_degenerate_normalize_returns_none() {
        assert_eq!(Vec3::zero().normalize(), None);
        assert_eq!(Vec3::new(f64::NAN, 0.0, 1.0).normalize(), None);
        assert_eq!(Vec3::new(0.0, f64::NEG_INFINITY, 1.0).normalize(), None);
    }
}
