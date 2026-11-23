use std::process::Command;

use rs_design_tokens::{
    contrast_ratio, emit_css, emit_dart, emit_ts, evaluate_contrast, Srgb, TokenSet, WcagLevel,
};

const BIN_PATH: &str = env!("CARGO_BIN_EXE_rs-design-tokens");

#[test]
fn cli_binary_contrast_outputs_expected_report() {
    let output = Command::new(BIN_PATH)
        .args(["contrast", "--fg", "#111111", "--bg", "#ffffff"])
        .output()
        .expect("failed to execute rs-design-tokens binary");

    assert!(output.status.success());
    let stdout = String::from_utf8(output.stdout).unwrap();
    assert!(stdout.contains("Foreground: #111111"));
    assert!(stdout.contains("Background: #ffffff"));
    assert!(stdout.contains("WCAG Level: AAA"));
}

#[test]
fn cli_binary_emit_css_ts_and_dart() {
    let common_args = [
        "--name",
        "ocean-ui",
        "--color",
        "primary=#0288d1",
        "--color",
        "surface=#fafafa",
        "--spacing",
        "md=16",
        "--radius",
        "pill=999",
    ];

    let css_out = Command::new(BIN_PATH)
        .args(["emit", "--format", "css"])
        .args(common_args)
        .output()
        .unwrap();
    assert!(css_out.status.success());
    let css = String::from_utf8(css_out.stdout).unwrap();
    assert!(css.contains(":root {"));
    assert!(css.contains("--color-primary: #0288d1;"));
    assert!(css.contains("--radius-pill: 999px;"));

    let ts_out = Command::new(BIN_PATH)
        .args(["emit", "--format", "ts"])
        .args(common_args)
        .output()
        .unwrap();
    assert!(ts_out.status.success());
    let ts = String::from_utf8(ts_out.stdout).unwrap();
    assert!(ts.contains("export const oceanUiTokens = {"));
    assert!(ts.contains("export type OceanUiTokens = typeof oceanUiTokens;"));

    let dart_out = Command::new(BIN_PATH)
        .args(["emit", "--format", "dart"])
        .args(common_args)
        .output()
        .unwrap();
    assert!(dart_out.status.success());
    let dart = String::from_utf8(dart_out.stdout).unwrap();
    assert!(dart.contains("class OceanUiTokens extends ThemeExtension<OceanUiTokens>"));
    assert!(dart.contains("Color(0xFF0288D1)"));
}

#[test]
fn cli_binary_invalid_args_exit_nonzero() {
    let output = Command::new(BIN_PATH)
        .args(["contrast", "--fg", "not-a-color", "--bg", "#ffffff"])
        .output()
        .unwrap();

    assert!(!output.status.success());
    let stderr = String::from_utf8(output.stderr).unwrap();
    assert!(stderr.contains("error:"));
}

#[test]
fn library_end_to_end_color_wcag_and_emit() {
    let fg = Srgb::from_hex("#1a237e").unwrap();
    let bg = Srgb::from_hex("#ffffff").unwrap();

    // Round-trip through OKLCH & HSL
    assert_eq!(Srgb::from_oklch(fg.to_oklch()), fg);
    assert_eq!(Srgb::from_hsl(fg.to_hsl()), fg);

    let report = evaluate_contrast(fg, bg);
    assert_eq!(report.level, WcagLevel::Aaa);
    assert!(contrast_ratio(fg, bg) > 12.0);

    let tokens = TokenSet::new("brand")
        .with_color("fg", fg)
        .with_color("bg", bg)
        .with_spacing("base", 8.0)
        .with_radius("md", 6.0);

    assert!(emit_css(&tokens).contains("--color-fg: #1a237e;"));
    assert!(emit_ts(&tokens).contains("export const brandTokens = {"));
    assert!(emit_dart(&tokens).contains("class BrandTokens extends ThemeExtension<BrandTokens>"));
}
