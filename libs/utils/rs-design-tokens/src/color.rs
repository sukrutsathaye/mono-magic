//! Color space representations (`Srgb`, `Hsl`, `Oklch`), hex parsing/formatting,
//! and exact round-trip conversions (`sRGB <-> HSL`, `sRGB <-> OKLCH`).

use std::fmt;

/// IEC 61966-2-1 / WCAG 2.1 sRGB linearization threshold.
pub const SRGB_LINEAR_THRESHOLD: f64 = 0.04045;

/// Inverse sRGB gamma encoding threshold (`0.04045 / 12.92 ≈ 0.0031308`).
pub const LINEAR_SRGB_GAMMA_THRESHOLD: f64 = 0.0031308;

/// Errors returned when parsing hex color strings.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ColorError {
    /// Hex string length was not 3, 4, 6, or 8 hex digits (with optional leading `#`).
    InvalidHexFormat(String),
    /// Hex string contained a non-hexadecimal character.
    InvalidHexDigit(String),
}

impl fmt::Display for ColorError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidHexFormat(raw) => write!(
                f,
                "invalid hex color '{raw}': expected #RGB, #RGBA, #RRGGBB, or #RRGGBBAA"
            ),
            Self::InvalidHexDigit(raw) => write!(f, "invalid hex digit in color '{raw}'"),
        }
    }
}

impl std::error::Error for ColorError {}

/// 8-bit per channel sRGB color with alpha (`0..=255`).
#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Srgb {
    /// Red channel (`0..=255`).
    pub r: u8,
    /// Green channel (`0..=255`).
    pub g: u8,
    /// Blue channel (`0..=255`).
    pub b: u8,
    /// Alpha channel (`0..=255`, where `255` is fully opaque).
    pub a: u8,
}

/// Cylindrical HSL color representation.
#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Hsl {
    /// Hue in degrees `[0.0, 360.0)`.
    pub h: f64,
    /// Saturation in `[0.0, 1.0]`.
    pub s: f64,
    /// Lightness in `[0.0, 1.0]`.
    pub l: f64,
    /// Alpha opacity in `[0.0, 1.0]`.
    pub a: f64,
}

/// Perceptually uniform OKLCH color representation (Björn Ottosson's OKLab in polar form).
#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Oklch {
    /// Perceived lightness in `[0.0, 1.0]`.
    pub l: f64,
    /// Chroma (`>= 0.0`).
    pub c: f64,
    /// Hue angle in degrees `[0.0, 360.0)`.
    pub h: f64,
    /// Alpha opacity in `[0.0, 1.0]`.
    pub a: f64,
}

/// Converts a single gamma-encoded sRGB channel in `[0.0, 1.0]` to linear light.
#[inline]
pub fn srgb_channel_to_linear(channel: f64) -> f64 {
    let c = channel.clamp(0.0, 1.0);
    if c <= SRGB_LINEAR_THRESHOLD {
        c / 12.92
    } else {
        ((c + 0.055) / 1.055).powf(2.4)
    }
}

/// Converts a single linear-light sRGB channel in `[0.0, 1.0]` to gamma-encoded sRGB.
#[inline]
pub fn linear_channel_to_srgb(linear: f64) -> f64 {
    let c = linear.clamp(0.0, 1.0);
    if c <= LINEAR_SRGB_GAMMA_THRESHOLD {
        12.92 * c
    } else {
        1.055 * c.powf(1.0 / 2.4) - 0.055
    }
}

#[inline]
fn unit_to_u8(v: f64) -> u8 {
    (v.clamp(0.0, 1.0) * 255.0).round() as u8
}

#[inline]
fn parse_hex_byte(pair: &str, raw: &str) -> Result<u8, ColorError> {
    u8::from_str_radix(pair, 16).map_err(|_| ColorError::InvalidHexDigit(raw.to_string()))
}

#[inline]
fn parse_hex_nibble(nibble: &str, raw: &str) -> Result<u8, ColorError> {
    let v =
        u8::from_str_radix(nibble, 16).map_err(|_| ColorError::InvalidHexDigit(raw.to_string()))?;
    Ok((v << 4) | v)
}

impl Srgb {
    /// Creates an `Srgb` color with explicit RGBA channels.
    #[inline]
    pub const fn new(r: u8, g: u8, b: u8, a: u8) -> Self {
        Self { r, g, b, a }
    }

    /// Creates a fully opaque `Srgb` color (`a = 255`).
    #[inline]
    pub const fn rgb(r: u8, g: u8, b: u8) -> Self {
        Self { r, g, b, a: 255 }
    }

    /// Parses a hexadecimal color string in `#RGB`, `#RGBA`, `#RRGGBB`, or `#RRGGBBAA`
    /// format (leading `#` is optional, whitespace is trimmed, case-insensitive).
    pub fn from_hex(input: &str) -> Result<Self, ColorError> {
        let trimmed = input.trim();
        let hex = trimmed.strip_prefix('#').unwrap_or(trimmed);
        if !hex.is_ascii() {
            return Err(ColorError::InvalidHexDigit(trimmed.to_string()));
        }

        match hex.len() {
            3 => Ok(Self {
                r: parse_hex_nibble(&hex[0..1], trimmed)?,
                g: parse_hex_nibble(&hex[1..2], trimmed)?,
                b: parse_hex_nibble(&hex[2..3], trimmed)?,
                a: 255,
            }),
            4 => Ok(Self {
                r: parse_hex_nibble(&hex[0..1], trimmed)?,
                g: parse_hex_nibble(&hex[1..2], trimmed)?,
                b: parse_hex_nibble(&hex[2..3], trimmed)?,
                a: parse_hex_nibble(&hex[3..4], trimmed)?,
            }),
            6 => Ok(Self {
                r: parse_hex_byte(&hex[0..2], trimmed)?,
                g: parse_hex_byte(&hex[2..4], trimmed)?,
                b: parse_hex_byte(&hex[4..6], trimmed)?,
                a: 255,
            }),
            8 => Ok(Self {
                r: parse_hex_byte(&hex[0..2], trimmed)?,
                g: parse_hex_byte(&hex[2..4], trimmed)?,
                b: parse_hex_byte(&hex[4..6], trimmed)?,
                a: parse_hex_byte(&hex[6..8], trimmed)?,
            }),
            _ => Err(ColorError::InvalidHexFormat(trimmed.to_string())),
        }
    }

    /// Formats the RGB channels as lowercase `#rrggbb`.
    #[inline]
    pub fn to_hex(self) -> String {
        format!("#{:02x}{:02x}{:02x}", self.r, self.g, self.b)
    }

    /// Formats all RGBA channels as lowercase `#rrggbbaa`.
    #[inline]
    pub fn to_hex_rgba(self) -> String {
        format!("#{:02x}{:02x}{:02x}{:02x}", self.r, self.g, self.b, self.a)
    }

    /// Formats the color as `#rrggbb` when fully opaque, or `#rrggbbaa` when translucent.
    #[inline]
    pub fn to_css_hex(self) -> String {
        if self.a == 255 {
            self.to_hex()
        } else {
            self.to_hex_rgba()
        }
    }

    /// Packs channels into Flutter's `0xAARRGGBB` 32-bit unsigned integer layout.
    #[inline]
    pub const fn to_argb_u32(self) -> u32 {
        ((self.a as u32) << 24) | ((self.r as u32) << 16) | ((self.g as u32) << 8) | (self.b as u32)
    }

    /// Converts this `Srgb` color to [`Hsl`].
    pub fn to_hsl(self) -> Hsl {
        let r = self.r as f64 / 255.0;
        let g = self.g as f64 / 255.0;
        let b = self.b as f64 / 255.0;
        let a = self.a as f64 / 255.0;

        let max = r.max(g).max(b);
        let min = r.min(g).min(b);
        let delta = max - min;
        let l = (max + min) * 0.5;

        if delta.abs() <= 1e-12 {
            return Hsl {
                h: 0.0,
                s: 0.0,
                l,
                a,
            };
        }

        let s = delta / (1.0 - (2.0 * l - 1.0).abs());
        let raw_h = if (max - r).abs() <= 1e-12 {
            60.0 * (((g - b) / delta).rem_euclid(6.0))
        } else if (max - g).abs() <= 1e-12 {
            60.0 * (((b - r) / delta) + 2.0)
        } else {
            60.0 * (((r - g) / delta) + 4.0)
        };

        Hsl {
            h: raw_h.rem_euclid(360.0),
            s: s.clamp(0.0, 1.0),
            l: l.clamp(0.0, 1.0),
            a,
        }
    }

    /// Converts an [`Hsl`] color to [`Srgb`].
    pub fn from_hsl(hsl: Hsl) -> Self {
        let h = hsl.h.rem_euclid(360.0);
        let s = hsl.s.clamp(0.0, 1.0);
        let l = hsl.l.clamp(0.0, 1.0);

        let c = (1.0 - (2.0 * l - 1.0).abs()) * s;
        let x = c * (1.0 - ((h / 60.0) % 2.0 - 1.0).abs());
        let m = l - c * 0.5;

        let (r1, g1, b1) = match h {
            h if h < 60.0 => (c, x, 0.0),
            h if h < 120.0 => (x, c, 0.0),
            h if h < 180.0 => (0.0, c, x),
            h if h < 240.0 => (0.0, x, c),
            h if h < 300.0 => (x, 0.0, c),
            _ => (c, 0.0, x),
        };

        Self {
            r: unit_to_u8(r1 + m),
            g: unit_to_u8(g1 + m),
            b: unit_to_u8(b1 + m),
            a: unit_to_u8(hsl.a),
        }
    }

    /// Converts this `Srgb` color to [`Oklch`] via linear sRGB and Björn Ottosson's OKLab matrices.
    pub fn to_oklch(self) -> Oklch {
        let r = srgb_channel_to_linear(self.r as f64 / 255.0);
        let g = srgb_channel_to_linear(self.g as f64 / 255.0);
        let b = srgb_channel_to_linear(self.b as f64 / 255.0);

        let l = 0.412_221_470_8 * r + 0.536_332_536_3 * g + 0.051_445_992_9 * b;
        let m = 0.211_903_498_2 * r + 0.680_699_545_1 * g + 0.107_396_956_6 * b;
        let s = 0.088_302_461_9 * r + 0.281_718_837_6 * g + 0.629_978_700_5 * b;

        let l_ = l.cbrt();
        let m_ = m.cbrt();
        let s_ = s.cbrt();

        let lab_l = 0.210_454_255_3 * l_ + 0.793_617_785_0 * m_ - 0.004_072_046_8 * s_;
        let lab_a = 1.977_998_495_1 * l_ - 2.428_592_205_0 * m_ + 0.450_593_709_9 * s_;
        let lab_b = 0.025_904_037_1 * l_ + 0.782_771_766_2 * m_ - 0.808_675_766_0 * s_;

        let c = (lab_a * lab_a + lab_b * lab_b).sqrt();
        let h = if c < 1e-10 {
            0.0
        } else {
            lab_b.atan2(lab_a).to_degrees().rem_euclid(360.0)
        };

        Oklch {
            l: lab_l,
            c,
            h,
            a: self.a as f64 / 255.0,
        }
    }

    /// Converts an [`Oklch`] color back to [`Srgb`] (clamping out-of-gamut channels to `[0, 255]`).
    pub fn from_oklch(oklch: Oklch) -> Self {
        let h_rad = oklch.h.to_radians();
        let lab_a = oklch.c * h_rad.cos();
        let lab_b = oklch.c * h_rad.sin();

        let l_ = oklch.l + 0.396_337_777_4 * lab_a + 0.215_803_757_3 * lab_b;
        let m_ = oklch.l - 0.105_561_345_8 * lab_a - 0.063_854_172_8 * lab_b;
        let s_ = oklch.l - 0.089_484_177_5 * lab_a - 1.291_485_548_0 * lab_b;

        let l = l_ * l_ * l_;
        let m = m_ * m_ * m_;
        let s = s_ * s_ * s_;

        let lin_r = 4.076_741_662_1 * l - 3.307_711_591_3 * m + 0.230_969_929_2 * s;
        let lin_g = -1.268_438_004_6 * l + 2.609_757_401_1 * m - 0.341_319_396_5 * s;
        let lin_b = -0.004_196_086_3 * l - 0.703_418_614_7 * m + 1.707_614_701_0 * s;

        Self {
            r: unit_to_u8(linear_channel_to_srgb(lin_r)),
            g: unit_to_u8(linear_channel_to_srgb(lin_g)),
            b: unit_to_u8(linear_channel_to_srgb(lin_b)),
            a: unit_to_u8(oklch.a),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hex_parsing_and_formatting() {
        assert_eq!(Srgb::from_hex("#fff").unwrap(), Srgb::rgb(255, 255, 255));
        assert_eq!(
            Srgb::from_hex("#0f8c").unwrap(),
            Srgb::new(0, 255, 136, 204)
        );
        assert_eq!(
            Srgb::from_hex("1a2b3c").unwrap(),
            Srgb::rgb(0x1a, 0x2b, 0x3c)
        );
        assert_eq!(
            Srgb::from_hex("  #1A2B3C80  ").unwrap(),
            Srgb::new(0x1a, 0x2b, 0x3c, 0x80)
        );

        let c = Srgb::new(0x1a, 0x2b, 0x3c, 0x80);
        assert_eq!(c.to_hex(), "#1a2b3c");
        assert_eq!(c.to_hex_rgba(), "#1a2b3c80");
        assert_eq!(c.to_css_hex(), "#1a2b3c80");
        assert_eq!(c.to_argb_u32(), 0x801a_2b3c);
        assert_eq!(Srgb::rgb(0x1a, 0x2b, 0x3c).to_css_hex(), "#1a2b3c");

        assert!(matches!(
            Srgb::from_hex("#12"),
            Err(ColorError::InvalidHexFormat(_))
        ));
        assert!(matches!(
            Srgb::from_hex("#gggggg"),
            Err(ColorError::InvalidHexDigit(_))
        ));
        assert!(matches!(
            Srgb::from_hex("#😀😀😀"),
            Err(ColorError::InvalidHexDigit(_))
        ));
        assert!(!ColorError::InvalidHexFormat("x".into())
            .to_string()
            .is_empty());
        assert!(!ColorError::InvalidHexDigit("z".into())
            .to_string()
            .is_empty());
    }

    #[test]
    fn srgb_hsl_roundtrip() {
        let palette = [
            Srgb::rgb(0, 0, 0),
            Srgb::rgb(255, 255, 255),
            Srgb::rgb(128, 128, 128),
            Srgb::rgb(255, 0, 0),
            Srgb::rgb(0, 255, 0),
            Srgb::rgb(0, 0, 255),
            Srgb::rgb(255, 255, 0),
            Srgb::rgb(0, 255, 255),
            Srgb::rgb(255, 0, 255),
            Srgb::new(63, 81, 181, 200),
            Srgb::rgb(233, 30, 99),
            Srgb::rgb(255, 152, 0),
        ];

        for orig in palette {
            let hsl = orig.to_hsl();
            let back = Srgb::from_hsl(hsl);
            assert_eq!(orig, back, "HSL roundtrip mismatch for {orig:?} -> {hsl:?}");
        }
    }

    #[test]
    fn srgb_oklch_roundtrip() {
        let palette = [
            Srgb::rgb(0, 0, 0),
            Srgb::rgb(255, 255, 255),
            Srgb::rgb(120, 120, 120),
            Srgb::rgb(255, 0, 0),
            Srgb::rgb(0, 255, 0),
            Srgb::rgb(0, 0, 255),
            Srgb::rgb(25, 118, 210),
            Srgb::new(156, 39, 176, 180),
            Srgb::rgb(0, 150, 136),
            Srgb::rgb(255, 193, 7),
        ];

        for orig in palette {
            let oklch = orig.to_oklch();
            let back = Srgb::from_oklch(oklch);
            assert_eq!(
                orig, back,
                "OKLCH roundtrip mismatch for {orig:?} -> {oklch:?}"
            );
        }

        // White should have L ≈ 1.0 and C ≈ 0.0
        let white = Srgb::rgb(255, 255, 255).to_oklch();
        assert!((white.l - 1.0).abs() < 1e-6);
        assert!(white.c < 1e-6);
    }
}
