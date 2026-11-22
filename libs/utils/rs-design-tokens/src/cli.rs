//! Argument parsing and command execution for the `rs-design-tokens` CLI.

use crate::color::Srgb;
use crate::emit::{emit_css, emit_dart, emit_ts, TokenSet};
use crate::wcag::evaluate_contrast;

const HELP_TEXT: &str = "\
rs-design-tokens — WCAG 2.1 contrast auditor & CSS/TS/Dart design token emitter

USAGE:
  rs-design-tokens contrast --fg <hex> --bg <hex>
  rs-design-tokens emit --format <css|ts|dart> [--name <name>] [--color key=hex ...] [--spacing key=px ...] [--radius key=px ...]
  rs-design-tokens --help

SUBCOMMANDS:
  contrast    Evaluate WCAG 2.1 contrast ratio and AA/AAA compliance for a color pair
  emit        Emit design tokens as CSS custom properties, TypeScript, or Flutter/Dart ThemeExtension
";

/// Parses CLI arguments (excluding `argv[0]`) and returns formatted stdout on success
/// or a human-readable error message on failure.
pub fn run_cli<I, S>(args: I) -> Result<String, String>
where
    I: IntoIterator<Item = S>,
    S: AsRef<str>,
{
    let argv: Vec<String> = args.into_iter().map(|s| s.as_ref().to_string()).collect();
    if argv.is_empty() || matches!(argv[0].as_str(), "--help" | "-h" | "help") {
        return Ok(HELP_TEXT.to_string());
    }

    match argv[0].as_str() {
        "contrast" => run_contrast(&argv[1..]),
        "emit" => run_emit(&argv[1..]),
        other => Err(format!(
            "unknown subcommand '{other}'. Run with --help for usage."
        )),
    }
}

fn require_next<'a>(args: &'a [String], idx: &mut usize, flag: &str) -> Result<&'a str, String> {
    *idx += 1;
    args.get(*idx)
        .map(String::as_str)
        .ok_or_else(|| format!("missing value for {flag}"))
}

fn parse_key_value<'a>(raw: &'a str, flag: &str) -> Result<(&'a str, &'a str), String> {
    let (key, value) = raw
        .split_once('=')
        .ok_or_else(|| format!("invalid {flag} entry '{raw}': expected key=value"))?;
    if key.trim().is_empty() || value.trim().is_empty() {
        return Err(format!(
            "invalid {flag} entry '{raw}': key and value must be non-empty"
        ));
    }
    Ok((key.trim(), value.trim()))
}

fn run_contrast(args: &[String]) -> Result<String, String> {
    let mut fg_raw: Option<&str> = None;
    let mut bg_raw: Option<&str> = None;

    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--fg" => fg_raw = Some(require_next(args, &mut i, "--fg")?),
            "--bg" => bg_raw = Some(require_next(args, &mut i, "--bg")?),
            "--help" | "-h" => return Ok(HELP_TEXT.to_string()),
            other => return Err(format!("unknown flag for contrast: '{other}'")),
        }
        i += 1;
    }

    let fg_str = fg_raw.ok_or_else(|| "contrast requires --fg <hex>".to_string())?;
    let bg_str = bg_raw.ok_or_else(|| "contrast requires --bg <hex>".to_string())?;

    let fg = Srgb::from_hex(fg_str).map_err(|e| e.to_string())?;
    let bg = Srgb::from_hex(bg_str).map_err(|e| e.to_string())?;
    let report = evaluate_contrast(fg, bg);

    Ok(format!(
        "Foreground: {}\nBackground: {}\nContrast Ratio: {:.2}:1\nWCAG Level: {}\nAA Normal (>=4.5): {}\nAA Large (>=3.0): {}\nAAA Normal (>=7.0): {}\nAAA Large (>=4.5): {}\n",
        report.foreground.to_css_hex(),
        report.background.to_css_hex(),
        report.ratio,
        report.level,
        if report.aa_normal { "PASS" } else { "FAIL" },
        if report.aa_large { "PASS" } else { "FAIL" },
        if report.aaa_normal { "PASS" } else { "FAIL" },
        if report.aaa_large { "PASS" } else { "FAIL" },
    ))
}

fn run_emit(args: &[String]) -> Result<String, String> {
    let mut format: Option<&str> = None;
    let mut tokens = TokenSet::new("theme");

    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--format" => format = Some(require_next(args, &mut i, "--format")?),
            "--name" => tokens.name = require_next(args, &mut i, "--name")?.to_string(),
            "--color" => {
                let raw = require_next(args, &mut i, "--color")?;
                let (key, hex) = parse_key_value(raw, "--color")?;
                let color = Srgb::from_hex(hex).map_err(|e| e.to_string())?;
                tokens.colors.insert(key.to_string(), color);
            }
            "--spacing" => {
                let raw = require_next(args, &mut i, "--spacing")?;
                let (key, val) = parse_key_value(raw, "--spacing")?;
                let px: f64 = val
                    .parse()
                    .map_err(|_| format!("invalid spacing number '{val}' for key '{key}'"))?;
                if !px.is_finite() {
                    return Err(format!("spacing value for '{key}' must be finite"));
                }
                tokens.spacing.insert(key.to_string(), px);
            }
            "--radius" => {
                let raw = require_next(args, &mut i, "--radius")?;
                let (key, val) = parse_key_value(raw, "--radius")?;
                let px: f64 = val
                    .parse()
                    .map_err(|_| format!("invalid radius number '{val}' for key '{key}'"))?;
                if !px.is_finite() {
                    return Err(format!("radius value for '{key}' must be finite"));
                }
                tokens.radii.insert(key.to_string(), px);
            }
            "--help" | "-h" => return Ok(HELP_TEXT.to_string()),
            other => return Err(format!("unknown flag for emit: '{other}'")),
        }
        i += 1;
    }

    let fmt = format.ok_or_else(|| "emit requires --format <css|ts|dart>".to_string())?;
    match fmt {
        "css" => Ok(emit_css(&tokens)),
        "ts" => Ok(emit_ts(&tokens)),
        "dart" => Ok(emit_dart(&tokens)),
        other => Err(format!(
            "unsupported format '{other}': expected css, ts, or dart"
        )),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cli_help_and_unknown_commands() {
        assert!(run_cli::<[&str; 0], &str>([]).unwrap().contains("USAGE:"));
        assert!(run_cli(["--help"]).unwrap().contains("SUBCOMMANDS:"));
        assert!(run_cli(["unknown"]).is_err());
    }

    #[test]
    fn cli_contrast_command() {
        let out = run_cli(["contrast", "--fg", "#000000", "--bg", "#ffffff"]).unwrap();
        assert!(out.contains("Contrast Ratio: 21.00:1"));
        assert!(out.contains("WCAG Level: AAA"));
        assert!(out.contains("AA Normal (>=4.5): PASS"));

        assert!(run_cli(["contrast", "--fg", "#000"]).is_err());
        assert!(run_cli(["contrast", "--fg", "#zzz", "--bg", "#fff"]).is_err());
        assert!(run_cli(["contrast", "--bogus"]).is_err());
    }

    #[test]
    fn cli_emit_commands() {
        let css = run_cli([
            "emit",
            "--format",
            "css",
            "--name",
            "brand",
            "--color",
            "primary=#1976d2",
            "--spacing",
            "md=16",
            "--radius",
            "sm=4",
        ])
        .unwrap();
        assert!(css.contains("--color-primary: #1976d2;"));
        assert!(css.contains("--spacing-md: 16px;"));
        assert!(css.contains("--radius-sm: 4px;"));

        let ts = run_cli([
            "emit",
            "--format",
            "ts",
            "--name",
            "brand",
            "--color",
            "primary=#1976d2",
        ])
        .unwrap();
        assert!(ts.contains("export const brandTokens = {"));

        let dart = run_cli([
            "emit",
            "--format",
            "dart",
            "--name",
            "brand",
            "--color",
            "primary=#1976d2",
        ])
        .unwrap();
        assert!(dart.contains("class BrandTokens extends ThemeExtension<BrandTokens>"));

        assert!(run_cli(["emit"]).is_err());
        assert!(run_cli(["emit", "--format", "xml"]).is_err());
        assert!(run_cli(["emit", "--format", "css", "--color", "badpair"]).is_err());
        assert!(run_cli(["emit", "--format", "css", "--spacing", "md=abc"]).is_err());
        assert!(run_cli(["emit", "--format", "css", "--radius", "sm=NaN"]).is_err());
    }
}
