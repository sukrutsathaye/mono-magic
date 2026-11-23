//! WCAG 2.1 relative luminance and contrast ratio evaluation.
//!
//! Uses the updated WCAG 2.1 sRGB linearization threshold `0.04045`
//! (`SRGB_LINEAR_THRESHOLD`) and standard Rec. 709 luminance weights
//! (`0.2126 * R + 0.7152 * G + 0.0722 * B`).

use std::fmt;

use crate::color::{srgb_channel_to_linear, Srgb};

/// Minimum WCAG 2.1 contrast ratio for AA large text (`>= 18pt` or `>= 14pt` bold).
pub const WCAG_AA_LARGE_MIN: f64 = 3.0;

/// Minimum WCAG 2.1 contrast ratio for AA normal text and AAA large text.
pub const WCAG_AA_NORMAL_MIN: f64 = 4.5;

/// Minimum WCAG 2.1 contrast ratio for AAA normal text.
pub const WCAG_AAA_NORMAL_MIN: f64 = 7.0;

/// Highest WCAG 2.1 conformance tier met by a foreground/background color pair.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum WcagLevel {
    /// Contrast ratio `< 3.0` (fails WCAG 2.1 AA even for large text).
    Fail,
    /// Contrast ratio `>= 3.0` and `< 4.5` (passes AA for large text only).
    AaLarge,
    /// Contrast ratio `>= 4.5` and `< 7.0` (passes AA normal & AAA large).
    Aa,
    /// Contrast ratio `>= 7.0` (passes AAA normal & all lower tiers).
    Aaa,
}

impl fmt::Display for WcagLevel {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Fail => write!(f, "FAIL"),
            Self::AaLarge => write!(f, "AA Large"),
            Self::Aa => write!(f, "AA"),
            Self::Aaa => write!(f, "AAA"),
        }
    }
}

/// Detailed WCAG 2.1 contrast evaluation report for a color pair.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct ContrastReport {
    /// Foreground (text/icon) color.
    pub foreground: Srgb,
    /// Background surface color.
    pub background: Srgb,
    /// WCAG 2.1 contrast ratio in `[1.0, 21.0]`.
    pub ratio: f64,
    /// Highest conformance tier met.
    pub level: WcagLevel,
    /// Whether the pair meets WCAG 2.1 AA for normal text (`>= 4.5`).
    pub aa_normal: bool,
    /// Whether the pair meets WCAG 2.1 AA for large text (`>= 3.0`).
    pub aa_large: bool,
    /// Whether the pair meets WCAG 2.1 AAA for normal text (`>= 7.0`).
    pub aaa_normal: bool,
    /// Whether the pair meets WCAG 2.1 AAA for large text (`>= 4.5`).
    pub aaa_large: bool,
}

/// Computes the WCAG 2.1 relative luminance `L` in `[0.0, 1.0]` for an [`Srgb`] color.
///
/// Uses the WCAG 2.1 updated linearization threshold `0.04045`.
#[inline]
pub fn relative_luminance(color: Srgb) -> f64 {
    let r = srgb_channel_to_linear(color.r as f64 / 255.0);
    let g = srgb_channel_to_linear(color.g as f64 / 255.0);
    let b = srgb_channel_to_linear(color.b as f64 / 255.0);
    0.2126 * r + 0.7152 * g + 0.0722 * b
}

/// Computes the symmetric WCAG 2.1 contrast ratio `(L1 + 0.05) / (L2 + 0.05)` in `[1.0, 21.0]`.
#[inline]
pub fn contrast_ratio(fg: Srgb, bg: Srgb) -> f64 {
    let l_fg = relative_luminance(fg);
    let l_bg = relative_luminance(bg);
    let (lighter, darker) = if l_fg >= l_bg {
        (l_fg, l_bg)
    } else {
        (l_bg, l_fg)
    };
    (lighter + 0.05) / (darker + 0.05)
}

/// Returns `true` if `fg` and `bg` meet WCAG 2.1 AA (`>= 3.0` for `large_text`, `>= 4.5` otherwise).
#[inline]
pub fn meets_aa(fg: Srgb, bg: Srgb, large_text: bool) -> bool {
    let threshold = if large_text {
        WCAG_AA_LARGE_MIN
    } else {
        WCAG_AA_NORMAL_MIN
    };
    contrast_ratio(fg, bg) >= threshold
}

/// Returns `true` if `fg` and `bg` meet WCAG 2.1 AAA (`>= 4.5` for `large_text`, `>= 7.0` otherwise).
#[inline]
pub fn meets_aaa(fg: Srgb, bg: Srgb, large_text: bool) -> bool {
    let threshold = if large_text {
        WCAG_AA_NORMAL_MIN
    } else {
        WCAG_AAA_NORMAL_MIN
    };
    contrast_ratio(fg, bg) >= threshold
}

/// Evaluates `fg` against `bg` and returns a complete [`ContrastReport`].
pub fn evaluate_contrast(fg: Srgb, bg: Srgb) -> ContrastReport {
    let ratio = contrast_ratio(fg, bg);
    let aa_large = ratio >= WCAG_AA_LARGE_MIN;
    let aa_normal = ratio >= WCAG_AA_NORMAL_MIN;
    let aaa_large = ratio >= WCAG_AA_NORMAL_MIN;
    let aaa_normal = ratio >= WCAG_AAA_NORMAL_MIN;

    let level = if aaa_normal {
        WcagLevel::Aaa
    } else if aa_normal {
        WcagLevel::Aa
    } else if aa_large {
        WcagLevel::AaLarge
    } else {
        WcagLevel::Fail
    };

    ContrastReport {
        foreground: fg,
        background: bg,
        ratio,
        level,
        aa_normal,
        aa_large,
        aaa_normal,
        aaa_large,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn luminance_and_contrast_extrema() {
        let black = Srgb::rgb(0, 0, 0);
        let white = Srgb::rgb(255, 255, 255);

        assert!((relative_luminance(black) - 0.0).abs() < 1e-12);
        assert!((relative_luminance(white) - 1.0).abs() < 1e-12);

        assert!((contrast_ratio(black, white) - 21.0).abs() < 1e-10);
        assert!((contrast_ratio(white, black) - 21.0).abs() < 1e-10);
        assert!((contrast_ratio(white, white) - 1.0).abs() < 1e-12);
    }

    #[test]
    fn wcag_levels_and_boundaries() {
        let white = Srgb::rgb(255, 255, 255);

        // #767676 on #ffffff is the canonical WCAG AA normal boundary (~4.54:1)
        let gray_aa = Srgb::from_hex("#767676").unwrap();
        let report_aa = evaluate_contrast(gray_aa, white);
        assert_eq!(report_aa.level, WcagLevel::Aa);
        assert!(report_aa.aa_normal);
        assert!(report_aa.aaa_large);
        assert!(!report_aa.aaa_normal);
        assert!(meets_aa(gray_aa, white, false));
        assert!(meets_aaa(gray_aa, white, true));
        assert!(!meets_aaa(gray_aa, white, false));

        // #949494 on #ffffff (~3.03:1) -> AA Large only
        let gray_large = Srgb::from_hex("#949494").unwrap();
        let report_large = evaluate_contrast(gray_large, white);
        assert_eq!(report_large.level, WcagLevel::AaLarge);
        assert!(meets_aa(gray_large, white, true));
        assert!(!meets_aa(gray_large, white, false));

        // #595959 on #ffffff (~7.0:1) -> AAA
        let gray_aaa = Srgb::from_hex("#595959").unwrap();
        let report_aaa = evaluate_contrast(gray_aaa, white);
        assert_eq!(report_aaa.level, WcagLevel::Aaa);
        assert!(meets_aaa(gray_aaa, white, false));

        // #cccccc on #ffffff (~1.61:1) -> Fail
        let light_gray = Srgb::from_hex("#cccccc").unwrap();
        let report_fail = evaluate_contrast(light_gray, white);
        assert_eq!(report_fail.level, WcagLevel::Fail);
        assert!(!report_fail.aa_large);

        assert_eq!(WcagLevel::Fail.to_string(), "FAIL");
        assert_eq!(WcagLevel::AaLarge.to_string(), "AA Large");
        assert_eq!(WcagLevel::Aa.to_string(), "AA");
        assert_eq!(WcagLevel::Aaa.to_string(), "AAA");
    }
}
