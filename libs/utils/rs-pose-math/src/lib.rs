//! Pure, stateless, FFI/WASM-ready 2D/3D pose math, landmark similarity,
//! confidence filtering, and temporal smoothing filters (`EmaFilter`, `OneEuroFilter`).
//!
//! This crate has zero external dependencies and is safe for native, FFI, and
//! WebAssembly targets.

pub mod angle;
pub mod filter;
pub mod pose;
pub mod similarity;
pub mod vector;

pub use angle::{
    joint_angle_2d_deg, joint_angle_2d_rad, joint_angle_3d_deg, joint_angle_3d_rad,
    landmark_angle_2d_deg, landmark_angle_3d_deg,
};
pub use filter::{EmaFilter, FilterError, OneEuroFilter, PoseSmoother};
pub use pose::{filter_by_confidence, Landmark, PoseFrame};
pub use similarity::{cosine_similarity, normalize_pose_frame, pose_cosine_similarity};
pub use vector::{Vec2, Vec3, VECTOR_EPSILON};
