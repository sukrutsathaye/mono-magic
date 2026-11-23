//! Color space conversions (`sRGB <-> HSL`, `sRGB <-> OKLCH`), WCAG 2.1 contrast
//! ratio evaluation, and deterministic CSS, TypeScript, and Flutter/Dart design token emission.

pub mod cli;
pub mod color;
pub mod emit;
pub mod wcag;

pub use color::{
    linear_channel_to_srgb, srgb_channel_to_linear, ColorError, Hsl, Oklch, Srgb,
    LINEAR_SRGB_GAMMA_THRESHOLD, SRGB_LINEAR_THRESHOLD,
};
pub use emit::{
    emit_css, emit_dart, emit_ts, to_camel_case, to_kebab_case, to_pascal_case, TokenSet,
};
pub use wcag::{
    contrast_ratio, evaluate_contrast, meets_aa, meets_aaa, relative_luminance, ContrastReport,
    WcagLevel, WCAG_AAA_NORMAL_MIN, WCAG_AA_LARGE_MIN, WCAG_AA_NORMAL_MIN,
};
