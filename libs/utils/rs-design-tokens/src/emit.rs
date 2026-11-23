//! Deterministic design token emitters for CSS custom properties, TypeScript, and Flutter/Dart.

use std::collections::BTreeMap;
use std::fmt::Write as _;

use crate::color::Srgb;

/// A structured, deterministically ordered set of design tokens.
///
/// Uses [`BTreeMap`] for all token groups so emitted outputs are always sorted
/// lexicographically by token key.
#[derive(Debug, Clone, PartialEq)]
pub struct TokenSet {
    /// Theme/token set identifier (e.g. `"brand"`, `"mono-magic"`).
    pub name: String,
    /// Named color tokens.
    pub colors: BTreeMap<String, Srgb>,
    /// Named spacing tokens in logical pixels.
    pub spacing: BTreeMap<String, f64>,
    /// Named border-radius tokens in logical pixels.
    pub radii: BTreeMap<String, f64>,
}

impl TokenSet {
    /// Creates an empty [`TokenSet`] with the given `name`.
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            colors: BTreeMap::new(),
            spacing: BTreeMap::new(),
            radii: BTreeMap::new(),
        }
    }

    /// Inserts a color token and returns `self` for fluent construction.
    pub fn with_color(mut self, key: impl Into<String>, color: Srgb) -> Self {
        self.colors.insert(key.into(), color);
        self
    }

    /// Inserts a spacing token (in `px`) and returns `self` for fluent construction.
    pub fn with_spacing(mut self, key: impl Into<String>, value_px: f64) -> Self {
        self.spacing.insert(key.into(), value_px);
        self
    }

    /// Inserts a border-radius token (in `px`) and returns `self` for fluent construction.
    pub fn with_radius(mut self, key: impl Into<String>, value_px: f64) -> Self {
        self.radii.insert(key.into(), value_px);
        self
    }
}

fn split_identifier_words(input: &str) -> Vec<String> {
    let mut words = Vec::new();
    let mut current = String::new();
    let mut prev_was_lower = false;

    for ch in input.chars() {
        if !ch.is_ascii_alphanumeric() {
            if !current.is_empty() {
                words.push(std::mem::take(&mut current));
            }
            prev_was_lower = false;
            continue;
        }
        if ch.is_ascii_uppercase() && prev_was_lower && !current.is_empty() {
            words.push(std::mem::take(&mut current));
        }
        current.push(ch.to_ascii_lowercase());
        prev_was_lower = ch.is_ascii_lowercase();
    }

    if !current.is_empty() {
        words.push(current);
    }
    words
}

/// Converts a token key or theme name to `kebab-case`.
pub fn to_kebab_case(input: &str) -> String {
    let words = split_identifier_words(input);
    if words.is_empty() {
        "default".to_string()
    } else {
        words.join("-")
    }
}

fn to_raw_camel_case(input: &str) -> String {
    let words = split_identifier_words(input);
    if words.is_empty() {
        return "default".to_string();
    }
    let mut out = String::new();
    for (idx, word) in words.iter().enumerate() {
        if idx == 0 {
            out.push_str(word);
        } else {
            let mut chars = word.chars();
            if let Some(first) = chars.next() {
                out.push(first.to_ascii_uppercase());
                out.push_str(chars.as_str());
            }
        }
    }
    out
}

fn format_ts_property_key(input: &str) -> String {
    let key = to_raw_camel_case(input);
    if key.starts_with(|c: char| c.is_ascii_digit()) {
        format!("'{key}'")
    } else {
        key
    }
}

/// Converts a token key or theme name to `camelCase` safe for JS/TS/Dart identifiers.
///
/// Identifiers whose sanitized form begins with an ASCII digit are prefixed with `token`.
pub fn to_camel_case(input: &str) -> String {
    let out = to_raw_camel_case(input);
    if out.starts_with(|c: char| c.is_ascii_digit()) {
        format!("token{out}")
    } else {
        out
    }
}

/// Converts a token key or theme name to `PascalCase` safe for TS/Dart type identifiers.
///
/// Identifiers whose sanitized form begins with an ASCII digit are prefixed with `Token`.
pub fn to_pascal_case(input: &str) -> String {
    let words = split_identifier_words(input);
    if words.is_empty() {
        return "Default".to_string();
    }
    let mut out = String::new();
    for word in &words {
        let mut chars = word.chars();
        if let Some(first) = chars.next() {
            out.push(first.to_ascii_uppercase());
            out.push_str(chars.as_str());
        }
    }
    if out.starts_with(|c: char| c.is_ascii_digit()) {
        format!("Token{out}")
    } else {
        out
    }
}

fn format_number(value: f64) -> String {
    if value.fract().abs() < 1e-10 {
        format!("{}", value.round() as i64)
    } else {
        let s = format!("{value:.4}");
        s.trim_end_matches('0').trim_end_matches('.').to_string()
    }
}

fn format_dart_double(value: f64) -> String {
    let s = format_number(value);
    if s.contains('.') {
        s
    } else {
        format!("{s}.0")
    }
}

/// Emits a deterministic CSS `:root` block containing `--color-*`, `--spacing-*`,
/// and `--radius-*` custom properties.
pub fn emit_css(tokens: &TokenSet) -> String {
    let mut out = String::from(":root {\n");
    for (key, color) in &tokens.colors {
        let _ = writeln!(
            out,
            "  --color-{}: {};",
            to_kebab_case(key),
            color.to_css_hex()
        );
    }
    for (key, value) in &tokens.spacing {
        let _ = writeln!(
            out,
            "  --spacing-{}: {}px;",
            to_kebab_case(key),
            format_number(*value)
        );
    }
    for (key, value) in &tokens.radii {
        let _ = writeln!(
            out,
            "  --radius-{}: {}px;",
            to_kebab_case(key),
            format_number(*value)
        );
    }
    out.push_str("}\n");
    out
}

/// Emits a deterministic TypeScript `as const` theme token object and inferred type.
pub fn emit_ts(tokens: &TokenSet) -> String {
    let camel_name = to_camel_case(&tokens.name);
    let pascal_name = to_pascal_case(&tokens.name);
    let mut out = String::new();

    let _ = writeln!(out, "export const {camel_name}Tokens = {{");

    out.push_str("  colors: {\n");
    for (key, color) in &tokens.colors {
        let _ = writeln!(
            out,
            "    {}: '{}',",
            format_ts_property_key(key),
            color.to_css_hex()
        );
    }
    out.push_str("  },\n");

    out.push_str("  spacing: {\n");
    for (key, value) in &tokens.spacing {
        let _ = writeln!(
            out,
            "    {}: {},",
            format_ts_property_key(key),
            format_number(*value)
        );
    }
    out.push_str("  },\n");

    out.push_str("  radii: {\n");
    for (key, value) in &tokens.radii {
        let _ = writeln!(
            out,
            "    {}: {},",
            format_ts_property_key(key),
            format_number(*value)
        );
    }
    out.push_str("  },\n");

    out.push_str("} as const;\n\n");
    let _ = writeln!(
        out,
        "export type {pascal_name}Tokens = typeof {camel_name}Tokens;"
    );
    out
}

/// Emits a deterministic Flutter/Dart `ThemeExtension` class with `Color(0xAARRGGBB)`
/// values, `double` spacing/radii fields, `copyWith`, and `lerp`.
pub fn emit_dart(tokens: &TokenSet) -> String {
    let class_name = format!("{}Tokens", to_pascal_case(&tokens.name));
    let mut out = String::new();

    out.push_str("import 'dart:ui';\n");
    out.push_str("import 'package:flutter/material.dart';\n\n");
    let _ = writeln!(
        out,
        "class {class_name} extends ThemeExtension<{class_name}> {{"
    );

    // Fields
    let mut field_specs: Vec<(String, String, String, bool)> = Vec::new();
    for (key, color) in &tokens.colors {
        let field = format!("color{}", to_pascal_case(key));
        let default_expr = format!("Color(0x{:08X})", color.to_argb_u32());
        field_specs.push((field, "Color".to_string(), default_expr, true));
    }
    for (key, value) in &tokens.spacing {
        let field = format!("spacing{}", to_pascal_case(key));
        field_specs.push((
            field,
            "double".to_string(),
            format_dart_double(*value),
            false,
        ));
    }
    for (key, value) in &tokens.radii {
        let field = format!("radius{}", to_pascal_case(key));
        field_specs.push((
            field,
            "double".to_string(),
            format_dart_double(*value),
            false,
        ));
    }

    for (field, ty, _, _) in &field_specs {
        let _ = writeln!(out, "  final {ty} {field};");
    }

    // Constructor
    if field_specs.is_empty() {
        let _ = writeln!(out, "\n  const {class_name}();");
    } else {
        let _ = writeln!(out, "\n  const {class_name}({{");
        for (field, _, _, _) in &field_specs {
            let _ = writeln!(out, "    required this.{field},");
        }
        out.push_str("  });\n");
    }

    // Defaults constant
    if field_specs.is_empty() {
        let _ = writeln!(
            out,
            "\n  static const {class_name} defaults = {class_name}();"
        );
    } else {
        let _ = writeln!(
            out,
            "\n  static const {class_name} defaults = {class_name}("
        );
        for (field, _, default_expr, _) in &field_specs {
            let _ = writeln!(out, "    {field}: {default_expr},");
        }
        out.push_str("  );\n");
    }

    // copyWith
    out.push_str("\n  @override\n");
    if field_specs.is_empty() {
        let _ = writeln!(out, "  {class_name} copyWith() => const {class_name}();");
    } else {
        let _ = writeln!(out, "  {class_name} copyWith({{");
        for (field, ty, _, _) in &field_specs {
            let _ = writeln!(out, "    {ty}? {field},");
        }
        out.push_str("  }) {\n");
        let _ = writeln!(out, "    return {class_name}(");
        for (field, _, _, _) in &field_specs {
            let _ = writeln!(out, "      {field}: {field} ?? this.{field},");
        }
        out.push_str("    );\n  }\n");
    }

    // lerp
    out.push_str("\n  @override\n");
    let _ = writeln!(
        out,
        "  {class_name} lerp(covariant ThemeExtension<{class_name}>? other, double t) {{"
    );
    let _ = writeln!(out, "    if (other is! {class_name}) {{");
    out.push_str("      return this;\n    }\n");
    if field_specs.is_empty() {
        let _ = writeln!(out, "    return const {class_name}();");
    } else {
        let _ = writeln!(out, "    return {class_name}(");
        for (field, _, _, is_color) in &field_specs {
            if *is_color {
                let _ = writeln!(
                    out,
                    "      {field}: Color.lerp({field}, other.{field}, t) ?? {field},"
                );
            } else {
                let _ = writeln!(
                    out,
                    "      {field}: lerpDouble({field}, other.{field}, t) ?? {field},"
                );
            }
        }
        out.push_str("    );\n");
    }
    out.push_str("  }\n");
    out.push_str("}\n");
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_tokens() -> TokenSet {
        TokenSet::new("mono-magic")
            .with_color("primary", Srgb::from_hex("#1976d2").unwrap())
            .with_color("overlay", Srgb::from_hex("#00000080").unwrap())
            .with_spacing("md", 16.0)
            .with_spacing("sm", 8.5)
            .with_radius("card", 12.0)
    }

    #[test]
    fn case_converters_handle_delimiters_and_empty() {
        assert_eq!(to_kebab_case("primaryMain"), "primary-main");
        assert_eq!(to_camel_case("mono-magic_ui"), "monoMagicUi");
        assert_eq!(to_pascal_case("mono-magic"), "MonoMagic");
        assert_eq!(to_camel_case("123-brand"), "token123Brand");
        assert_eq!(to_pascal_case("123-brand"), "Token123Brand");
        assert_eq!(to_camel_case("1primary"), "token1primary");
        assert_eq!(to_pascal_case("2xl"), "Token2xl");
        assert_eq!(to_kebab_case("___"), "default");
        assert_eq!(to_camel_case(""), "default");
        assert_eq!(to_pascal_case(""), "Default");
    }

    #[test]
    fn emit_css_is_deterministic_and_sorted() {
        let css = emit_css(&sample_tokens());
        let expected = "\
:root {
  --color-overlay: #00000080;
  --color-primary: #1976d2;
  --spacing-md: 16px;
  --spacing-sm: 8.5px;
  --radius-card: 12px;
}
";
        assert_eq!(css, expected);
    }

    #[test]
    fn emit_ts_is_valid_and_deterministic() {
        let ts = emit_ts(&sample_tokens());
        assert!(ts.contains("export const monoMagicTokens = {"));
        assert!(ts.contains("    overlay: '#00000080',"));
        assert!(ts.contains("    primary: '#1976d2',"));
        assert!(ts.contains("    md: 16,"));
        assert!(ts.contains("    sm: 8.5,"));
        assert!(ts.contains("    card: 12,"));
        assert!(ts.contains("export type MonoMagicTokens = typeof monoMagicTokens;"));
    }

    #[test]
    fn emit_dart_generates_theme_extension() {
        let dart = emit_dart(&sample_tokens());
        assert!(dart.contains("class MonoMagicTokens extends ThemeExtension<MonoMagicTokens>"));
        assert!(dart.contains("colorPrimary: Color(0xFF1976D2),"));
        assert!(dart.contains("colorOverlay: Color(0x80000000),"));
        assert!(dart.contains("spacingMd: 16.0,"));
        assert!(dart.contains("spacingSm: 8.5,"));
        assert!(dart.contains("radiusCard: 12.0,"));
        assert!(dart.contains("Color.lerp(colorPrimary, other.colorPrimary, t)"));
        assert!(dart.contains("lerpDouble(spacingMd, other.spacingMd, t)"));
    }

    #[test]
    fn emit_dart_handles_empty_token_set() {
        let dart = emit_dart(&TokenSet::new("empty"));
        assert!(dart.contains("const EmptyTokens();"));
        assert!(dart.contains("EmptyTokens copyWith() => const EmptyTokens();"));
    }

    #[test]
    fn emit_ts_and_dart_handle_digit_leading_names_and_keys() {
        let tokens = TokenSet::new("123-brand")
            .with_color("1primary", Srgb::from_hex("#1976d2").unwrap())
            .with_spacing("4", 16.0)
            .with_radius("2xl", 24.0);

        let ts = emit_ts(&tokens);
        assert!(ts.contains("export const token123BrandTokens = {"));
        assert!(ts.contains("    '1primary': '#1976d2',"));
        assert!(ts.contains("    '4': 16,"));
        assert!(ts.contains("    '2xl': 24,"));
        assert!(ts.contains("export type Token123BrandTokens = typeof token123BrandTokens;"));

        let dart = emit_dart(&tokens);
        assert!(
            dart.contains("class Token123BrandTokens extends ThemeExtension<Token123BrandTokens>")
        );
        assert!(dart.contains("final Color colorToken1primary;"));
        assert!(dart.contains("final double spacingToken4;"));
        assert!(dart.contains("final double radiusToken2xl;"));
        assert!(dart.contains("colorToken1primary: Color(0xFF1976D2),"));
        assert!(dart.contains("spacingToken4: 16.0,"));
        assert!(dart.contains("radiusToken2xl: 24.0,"));
    }
}
