use rs_pose_math::{
    cosine_similarity, filter_by_confidence, joint_angle_2d_deg, joint_angle_3d_deg,
    landmark_angle_3d_deg, normalize_pose_frame, pose_cosine_similarity, EmaFilter, Landmark,
    OneEuroFilter, PoseFrame, PoseSmoother, Vec2, Vec3,
};

#[test]
fn end_to_end_squat_angle_and_template_matching() {
    // Reference standing pose (hip -> knee -> ankle = 180 deg)
    let standing = PoseFrame::new(
        0.0,
        vec![
            Landmark::new(11, Vec3::new(0.0, 2.0, 0.0), 0.98), // shoulder
            Landmark::new(23, Vec3::new(0.0, 1.0, 0.0), 0.99), // hip
            Landmark::new(25, Vec3::new(0.0, 0.5, 0.0), 0.97), // knee
            Landmark::new(27, Vec3::new(0.0, 0.0, 0.0), 0.95), // ankle
            Landmark::new(99, Vec3::new(9.0, 9.0, 9.0), 0.10), // noisy ghost landmark
        ],
    );

    // Same standing pose translated & uniformly scaled by a different camera distance
    let scaled_standing = PoseFrame::new(
        0.033,
        vec![
            Landmark::new(11, Vec3::new(10.0, 6.0, -3.0), 0.96),
            Landmark::new(23, Vec3::new(10.0, 4.0, -3.0), 0.95),
            Landmark::new(25, Vec3::new(10.0, 3.0, -3.0), 0.94),
            Landmark::new(27, Vec3::new(10.0, 2.0, -3.0), 0.92),
        ],
    );

    let filtered = filter_by_confidence(&standing, 0.5);
    assert_eq!(filtered.landmarks.len(), 4);

    let knee_angle = landmark_angle_3d_deg(
        filtered.landmark_by_id(23).unwrap(),
        filtered.landmark_by_id(25).unwrap(),
        filtered.landmark_by_id(27).unwrap(),
        0.5,
    )
    .unwrap();
    assert!((knee_angle - 180.0).abs() < 1e-10);

    // Template similarity should be ~1.0 despite translation, scale, and ghost landmark.
    let sim = pose_cosine_similarity(&standing, &scaled_standing, 0.5).unwrap();
    assert!((sim - 1.0).abs() < 1e-12);

    // Pre-normalized vector comparison should match direct pose comparison.
    let v_ref = normalize_pose_frame(&standing, 0.5);
    let v_obs = normalize_pose_frame(&scaled_standing, 0.5);
    let vec_sim = cosine_similarity(&v_ref, &v_obs).unwrap();
    assert!((vec_sim - 1.0).abs() < 1e-12);
}

#[test]
fn pose_smoother_and_filters_converge_on_noisy_stream() {
    let mut smoother = PoseSmoother::new(1.0, 0.02, 1.0).unwrap();
    let mut angle_ema = EmaFilter::new(0.3).unwrap();
    let mut one_euro = OneEuroFilter::new(1.0, 0.02, 1.0).unwrap();

    let mut smoothed_errors = Vec::new();
    let mut raw_errors = Vec::new();

    for i in 0..40 {
        let t = i as f64 / 30.0;
        let jitter = if i % 2 == 0 { 0.08 } else { -0.08 };
        let frame = PoseFrame::new(
            t,
            vec![
                Landmark::new(0, Vec3::new(0.0, 1.0 + jitter, 0.0), 0.95),
                Landmark::new(1, Vec3::new(0.0, 0.0, 0.0), 0.99),
                Landmark::new(2, Vec3::new(1.0 + jitter, 0.0, 0.0), 0.95),
            ],
        );

        let smoothed = smoother.smooth(&frame).unwrap();
        let raw_y = frame.landmarks[0].position.y;
        let smooth_y = smoothed.landmarks[0].position.y;

        let filtered_scalar = one_euro.filter(raw_y, t).unwrap();
        assert!((filtered_scalar - smooth_y).abs() < 1e-12);

        if i >= 10 {
            raw_errors.push((raw_y - 1.0).abs());
            smoothed_errors.push((smooth_y - 1.0).abs());
        }

        let angle = joint_angle_3d_deg(
            smoothed.landmarks[0].position,
            smoothed.landmarks[1].position,
            smoothed.landmarks[2].position,
        )
        .unwrap();
        let smoothed_angle = angle_ema.filter(angle).unwrap();
        assert!((smoothed_angle - 90.0).abs() < 1e-6);
    }

    let avg_raw: f64 = raw_errors.iter().sum::<f64>() / raw_errors.len() as f64;
    let avg_smooth: f64 = smoothed_errors.iter().sum::<f64>() / smoothed_errors.len() as f64;
    assert!(
        avg_smooth < avg_raw * 0.6,
        "expected PoseSmoother to dampen jitter: raw={avg_raw}, smooth={avg_smooth}"
    );
}

#[test]
fn angle_invariants_across_2d_and_3d() {
    // Equilateral triangle has 60-degree interior angles.
    let a = Vec2::new(0.0, 0.0);
    let b = Vec2::new(1.0, 0.0);
    let c = Vec2::new(0.5, (3.0_f64).sqrt() / 2.0);
    assert!((joint_angle_2d_deg(a, b, c).unwrap() - 60.0).abs() < 1e-10);
    assert!(
        (joint_angle_3d_deg(
            Vec3::new(a.x, a.y, 2.0),
            Vec3::new(b.x, b.y, 2.0),
            Vec3::new(c.x, c.y, 2.0)
        )
        .unwrap()
            - 60.0)
            .abs()
            < 1e-10
    );
}
