# `rs-pose-math` (`rs-utils-pose-math`)

Pure, stateless, zero-dependency Rust math library for 2D/3D pose geometry, landmark normalization, cosine similarity template matching, confidence filtering, and temporal smoothing (`EmaFilter`, `OneEuroFilter`, `PoseSmoother`).

Core math structs (`Vec2`, `Vec3`, `Landmark`) use `#[repr(C)]` for straightforward FFI and future WebAssembly (`wasm-bindgen`) / Python (`PyO3`) bindings.

## Nx Targets

```bash
pnpm nx lint rs-utils-pose-math   # cargo clippy --all-targets -- -D warnings
pnpm nx test rs-utils-pose-math   # cargo test
pnpm nx build rs-utils-pose-math  # cargo build --release
```

## Public API

- **Vectors (`vector`)**: `Vec2`, `Vec3` with `add`, `sub`, `scale`, `dot`, `cross`, `norm`, `normalize`, `distance`, and operator overloads.
- **Pose Models (`pose`)**: `Landmark`, `PoseFrame`, `filter_by_confidence`.
- **Joint Angles (`angle`)**: `joint_angle_2d_rad`, `joint_angle_2d_deg`, `joint_angle_3d_rad`, `joint_angle_3d_deg`, `landmark_angle_2d_deg`, `landmark_angle_3d_deg`.
- **Pose Similarity (`similarity`)**: `normalize_pose_frame`, `cosine_similarity`, `pose_cosine_similarity`.
- **Temporal Smoothing (`filter`)**: `EmaFilter`, `OneEuroFilter`, `PoseSmoother`, `FilterError`.

## Usage Example

```rust
use rs_pose_math::{
    joint_angle_3d_deg, pose_cosine_similarity, Landmark, PoseFrame, PoseSmoother, Vec3,
};

let frame = PoseFrame::new(
    0.0,
    vec![
        Landmark::new(0, Vec3::new(0.0, 1.0, 0.0), 0.98),
        Landmark::new(1, Vec3::new(0.0, 0.0, 0.0), 0.99),
        Landmark::new(2, Vec3::new(1.0, 0.0, 0.0), 0.97),
    ],
);

let angle = joint_angle_3d_deg(
    frame.landmarks[0].position,
    frame.landmarks[1].position,
    frame.landmarks[2].position,
);
assert_eq!(angle.map(|a| a.round()), Some(90.0));

let mut smoother = PoseSmoother::new(1.0, 0.01, 1.0).unwrap();
let smoothed = smoother.smooth(&frame).unwrap();
let sim = pose_cosine_similarity(&frame, &smoothed, 0.5).unwrap();
assert!((sim - 1.0).abs() < 1e-12);
```
