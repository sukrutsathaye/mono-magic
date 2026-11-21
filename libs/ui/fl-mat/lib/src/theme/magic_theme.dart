/// Material 3 theme palettes, semantic color tokens, size metrics, and shape
/// helpers for `fl_mat`, aligned with the 7 `ng-mat` M3 palettes.
library;

import 'package:flutter/material.dart';

import '../interfaces/atomic_interfaces.dart';

/// Named Material 3 palettes matching the cross-library Mono-Magic design system.
enum MagicPaletteName {
  /// Default Azure Blue light palette.
  azureBlue(
    id: 'azure-blue',
    displayName: 'Azure Blue (Light)',
    brightness: Brightness.light,
  ),

  /// Violet primary / Orange tertiary light palette.
  lightTheme(
    id: 'light-theme',
    displayName: 'Violet / Orange (Light)',
    brightness: Brightness.light,
  ),

  /// Green primary / Orange tertiary dark palette.
  darkTheme(
    id: 'dark-theme',
    displayName: 'Green / Orange (Dark)',
    brightness: Brightness.dark,
  ),

  /// Rose primary / Red tertiary light palette.
  roseRed(
    id: 'rose-red',
    displayName: 'Rose Red (Light)',
    brightness: Brightness.light,
  ),

  /// Cyan primary / Orange tertiary dark palette.
  cyanOrange(
    id: 'cyan-orange',
    displayName: 'Cyan Orange (Dark)',
    brightness: Brightness.dark,
  ),

  /// Orange primary / Red tertiary light palette.
  orangeRed(
    id: 'orange-red',
    displayName: 'Orange Red (Light)',
    brightness: Brightness.light,
  ),

  /// Magenta primary / Violet tertiary dark palette.
  magentaViolet(
    id: 'magenta-violet',
    displayName: 'Magenta Violet (Dark)',
    brightness: Brightness.dark,
  );

  const MagicPaletteName({
    required this.id,
    required this.displayName,
    required this.brightness,
  });

  /// Kebab-case palette identifier matching `ng-mat` / Storybook theme globals.
  final String id;

  /// Human-readable palette title displayed in Widgetbook theme selectors.
  final String displayName;

  /// Whether this palette renders in light or dark mode.
  final Brightness brightness;
}

/// Custom Material 3 [ThemeExtension] carrying semantic `success`, `warning`,
/// and `neutral` color roles not present on standard [ColorScheme].
@immutable
class MagicSemanticColors extends ThemeExtension<MagicSemanticColors> {
  /// Creates a semantic color token extension.
  const MagicSemanticColors({
    required this.success,
    required this.onSuccess,
    required this.successContainer,
    required this.onSuccessContainer,
    required this.warning,
    required this.onWarning,
    required this.warningContainer,
    required this.onWarningContainer,
    required this.neutral,
    required this.onNeutral,
    required this.neutralContainer,
    required this.onNeutralContainer,
  });

  /// Default light-mode semantic tokens.
  static const MagicSemanticColors light = MagicSemanticColors(
    success: Color(0xFF1B6E3A),
    onSuccess: Color(0xFFFFFFFF),
    successContainer: Color(0xFFA0F5B4),
    onSuccessContainer: Color(0xFF00210C),
    warning: Color(0xFF8A5100),
    onWarning: Color(0xFFFFFFFF),
    warningContainer: Color(0xFFFFDCBD),
    onWarningContainer: Color(0xFF2D1600),
    neutral: Color(0xFF44474E),
    onNeutral: Color(0xFFFAF9FD),
    neutralContainer: Color(0xFFE3E2E6),
    onNeutralContainer: Color(0xFF1A1B1F),
  );

  /// Default dark-mode semantic tokens.
  static const MagicSemanticColors dark = MagicSemanticColors(
    success: Color(0xFF7FDC99),
    onSuccess: Color(0xFF00391A),
    successContainer: Color(0xFF00522A),
    onSuccessContainer: Color(0xFFA0F5B4),
    warning: Color(0xFFFFB870),
    onWarning: Color(0xFF4A2800),
    warningContainer: Color(0xFF693C00),
    onWarningContainer: Color(0xFFFFDCBD),
    neutral: Color(0xFFC4C6D0),
    onNeutral: Color(0xFF121410),
    neutralContainer: Color(0xFF333531),
    onNeutralContainer: Color(0xFFE2E3DC),
  );

  /// Creates palette-aware semantic colors from [scheme], binding neutral tokens
  /// directly to the scheme's surface/on-surface roles while preserving exact
  /// light/dark success and warning values.
  factory MagicSemanticColors.forColorScheme(ColorScheme scheme) {
    final base = scheme.brightness == Brightness.dark ? dark : light;
    return base.copyWith(
      neutral: scheme.onSurfaceVariant,
      onNeutral: scheme.surface,
      neutralContainer: scheme.surfaceContainerHighest,
      onNeutralContainer: scheme.onSurface,
    );
  }

  /// Primary success accent color.
  final Color success;

  /// Foreground color displayed on top of [success].
  final Color onSuccess;

  /// Tonal success container fill color.
  final Color successContainer;

  /// Foreground color displayed on top of [successContainer].
  final Color onSuccessContainer;

  /// Primary warning accent color.
  final Color warning;

  /// Foreground color displayed on top of [warning].
  final Color onWarning;

  /// Tonal warning container fill color.
  final Color warningContainer;

  /// Foreground color displayed on top of [warningContainer].
  final Color onWarningContainer;

  /// Neutral emphasis foreground/border color.
  final Color neutral;

  /// Foreground color displayed on top of [neutral].
  final Color onNeutral;

  /// Neutral tonal container fill color.
  final Color neutralContainer;

  /// Foreground color displayed on top of [neutralContainer].
  final Color onNeutralContainer;

  @override
  MagicSemanticColors copyWith({
    Color? success,
    Color? onSuccess,
    Color? successContainer,
    Color? onSuccessContainer,
    Color? warning,
    Color? onWarning,
    Color? warningContainer,
    Color? onWarningContainer,
    Color? neutral,
    Color? onNeutral,
    Color? neutralContainer,
    Color? onNeutralContainer,
  }) {
    return MagicSemanticColors(
      success: success ?? this.success,
      onSuccess: onSuccess ?? this.onSuccess,
      successContainer: successContainer ?? this.successContainer,
      onSuccessContainer: onSuccessContainer ?? this.onSuccessContainer,
      warning: warning ?? this.warning,
      onWarning: onWarning ?? this.onWarning,
      warningContainer: warningContainer ?? this.warningContainer,
      onWarningContainer: onWarningContainer ?? this.onWarningContainer,
      neutral: neutral ?? this.neutral,
      onNeutral: onNeutral ?? this.onNeutral,
      neutralContainer: neutralContainer ?? this.neutralContainer,
      onNeutralContainer: onNeutralContainer ?? this.onNeutralContainer,
    );
  }

  @override
  MagicSemanticColors lerp(
    covariant ThemeExtension<MagicSemanticColors>? other,
    double t,
  ) {
    if (other is! MagicSemanticColors) {
      return this;
    }
    return MagicSemanticColors(
      success: Color.lerp(success, other.success, t) ?? success,
      onSuccess: Color.lerp(onSuccess, other.onSuccess, t) ?? onSuccess,
      successContainer:
          Color.lerp(successContainer, other.successContainer, t) ??
          successContainer,
      onSuccessContainer:
          Color.lerp(onSuccessContainer, other.onSuccessContainer, t) ??
          onSuccessContainer,
      warning: Color.lerp(warning, other.warning, t) ?? warning,
      onWarning: Color.lerp(onWarning, other.onWarning, t) ?? onWarning,
      warningContainer:
          Color.lerp(warningContainer, other.warningContainer, t) ??
          warningContainer,
      onWarningContainer:
          Color.lerp(onWarningContainer, other.onWarningContainer, t) ??
          onWarningContainer,
      neutral: Color.lerp(neutral, other.neutral, t) ?? neutral,
      onNeutral: Color.lerp(onNeutral, other.onNeutral, t) ?? onNeutral,
      neutralContainer:
          Color.lerp(neutralContainer, other.neutralContainer, t) ??
          neutralContainer,
      onNeutralContainer:
          Color.lerp(onNeutralContainer, other.onNeutralContainer, t) ??
          onNeutralContainer,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) {
      return true;
    }
    return other is MagicSemanticColors &&
        other.success == success &&
        other.onSuccess == onSuccess &&
        other.successContainer == successContainer &&
        other.onSuccessContainer == onSuccessContainer &&
        other.warning == warning &&
        other.onWarning == onWarning &&
        other.warningContainer == warningContainer &&
        other.onWarningContainer == onWarningContainer &&
        other.neutral == neutral &&
        other.onNeutral == onNeutral &&
        other.neutralContainer == neutralContainer &&
        other.onNeutralContainer == onNeutralContainer;
  }

  @override
  int get hashCode => Object.hash(
    success,
    onSuccess,
    successContainer,
    onSuccessContainer,
    warning,
    onWarning,
    warningContainer,
    onWarningContainer,
    neutral,
    onNeutral,
    neutralContainer,
    onNeutralContainer,
  );
}

/// Resolved 4-role color tuple for a given [ColorIntent].
@immutable
class MagicIntentColorSet {
  /// Creates a resolved semantic color tuple.
  const MagicIntentColorSet({
    required this.main,
    required this.onMain,
    required this.container,
    required this.onContainer,
  });

  /// High-emphasis main color (e.g., filled background or active indicator).
  final Color main;

  /// Foreground content color paired with [main].
  final Color onMain;

  /// Medium-emphasis tonal container fill color.
  final Color container;

  /// Foreground content color paired with [container].
  final Color onContainer;

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) {
      return true;
    }
    return other is MagicIntentColorSet &&
        other.main == main &&
        other.onMain == onMain &&
        other.container == container &&
        other.onContainer == onContainer;
  }

  @override
  int get hashCode => Object.hash(main, onMain, container, onContainer);
}

/// Standardized dimensional metrics for an [AtomicSize] step.
@immutable
class MagicSizeMetrics {
  /// Creates a size metric set in logical pixels (dp).
  const MagicSizeMetrics({
    required this.height,
    required this.fontSize,
    required this.iconSize,
    required this.horizontalPadding,
    required this.verticalPadding,
  });

  /// Minimum interactive height in dp.
  final double height;

  /// Label font size in sp.
  final double fontSize;

  /// Leading/trailing icon size in dp.
  final double iconSize;

  /// Horizontal internal padding in dp.
  final double horizontalPadding;

  /// Vertical internal padding in dp.
  final double verticalPadding;

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) {
      return true;
    }
    return other is MagicSizeMetrics &&
        other.height == height &&
        other.fontSize == fontSize &&
        other.iconSize == iconSize &&
        other.horizontalPadding == horizontalPadding &&
        other.verticalPadding == verticalPadding;
  }

  @override
  int get hashCode => Object.hash(
    height,
    fontSize,
    iconSize,
    horizontalPadding,
    verticalPadding,
  );
}

/// Central theme factory and design-token resolver for `fl_mat`.
abstract final class MagicTheme {
  static const Color _lightError = Color(0xFFBA1A1A);
  static const Color _lightOnError = Color(0xFFFFFFFF);
  static const Color _lightErrorContainer = Color(0xFFFFDAD6);
  static const Color _lightOnErrorContainer = Color(0xFF410002);

  static const Color _darkError = Color(0xFFFFB4AB);
  static const Color _darkOnError = Color(0xFF690005);
  static const Color _darkErrorContainer = Color(0xFF93000A);
  static const Color _darkOnErrorContainer = Color(0xFFFFDAD6);

  /// Default Azure Blue (Light) Material 3 theme.
  static ThemeData get azureBlue => _buildTheme(
    seedColor: const Color(0xFF005CBB),
    brightness: Brightness.light,
    primary: const Color(0xFF005CBB),
    primaryContainer: const Color(0xFFD7E3FF),
    secondary: const Color(0xFF565E71),
    secondaryContainer: const Color(0xFFDAE2F9),
    tertiary: const Color(0xFF343DFF),
    tertiaryContainer: const Color(0xFFE0E0FF),
    surface: const Color(0xFFFAF9FD),
    surfaceContainerHighest: const Color(0xFFE3E2E6),
    onSurface: const Color(0xFF1A1B1F),
    outline: const Color(0xFF74777F),
  );

  /// Violet / Orange (Light) Material 3 theme.
  static ThemeData get lightTheme => _buildTheme(
    seedColor: const Color(0xFF7D00FA),
    brightness: Brightness.light,
    primary: const Color(0xFF7D00FA),
    primaryContainer: const Color(0xFFECDCFF),
    secondary: const Color(0xFF645B70),
    secondaryContainer: const Color(0xFFEADEF7),
    tertiary: const Color(0xFF964900),
    tertiaryContainer: const Color(0xFFFFDCC7),
    surface: const Color(0xFFFEF8FC),
    surfaceContainerHighest: const Color(0xFFE6E1E6),
    onSurface: const Color(0xFF1D1B1E),
    outline: const Color(0xFF7B757F),
  );

  /// Green / Orange (Dark) Material 3 theme.
  static ThemeData get darkTheme => _buildTheme(
    seedColor: const Color(0xFF026E00),
    brightness: Brightness.dark,
    primary: const Color(0xFF02E600),
    primaryContainer: const Color(0xFF015300),
    secondary: const Color(0xFFBBCBB2),
    secondaryContainer: const Color(0xFF3C4B37),
    tertiary: const Color(0xFFFFB787),
    tertiaryContainer: const Color(0xFF723600),
    surface: const Color(0xFF121410),
    surfaceContainerHighest: const Color(0xFF333531),
    onSurface: const Color(0xFFE2E3DC),
    outline: const Color(0xFF8D9387),
  );

  /// Rose Red (Light) Material 3 theme.
  static ThemeData get roseRed => _buildTheme(
    seedColor: const Color(0xFFBA005C),
    brightness: Brightness.light,
    primary: const Color(0xFFBA005C),
    primaryContainer: const Color(0xFFFFD9E1),
    secondary: const Color(0xFF74565D),
    secondaryContainer: const Color(0xFFFFD9E1),
    tertiary: const Color(0xFFC00100),
    tertiaryContainer: const Color(0xFFFFDAD4),
    surface: const Color(0xFFFFF8F8),
    surfaceContainerHighest: const Color(0xFFECE0E1),
    onSurface: const Color(0xFF201A1B),
    outline: const Color(0xFF847376),
  );

  /// Cyan Orange (Dark) Material 3 theme.
  static ThemeData get cyanOrange => _buildTheme(
    seedColor: const Color(0xFF006A6A),
    brightness: Brightness.dark,
    primary: const Color(0xFF00DDDD),
    primaryContainer: const Color(0xFF004F4F),
    secondary: const Color(0xFFB0CCCB),
    secondaryContainer: const Color(0xFF324B4B),
    tertiary: const Color(0xFFFFB787),
    tertiaryContainer: const Color(0xFF723600),
    surface: const Color(0xFF101414),
    surfaceContainerHighest: const Color(0xFF313635),
    onSurface: const Color(0xFFE0E3E2),
    outline: const Color(0xFF889392),
  );

  /// Orange Red (Light) Material 3 theme.
  static ThemeData get orangeRed => _buildTheme(
    seedColor: const Color(0xFF964900),
    brightness: Brightness.light,
    primary: const Color(0xFF964900),
    primaryContainer: const Color(0xFFFFDCC7),
    secondary: const Color(0xFF755846),
    secondaryContainer: const Color(0xFFFFDCC7),
    tertiary: const Color(0xFFC00100),
    tertiaryContainer: const Color(0xFFFFDAD4),
    surface: const Color(0xFFFFF8F5),
    surfaceContainerHighest: const Color(0xFFECE0DA),
    onSurface: const Color(0xFF201A17),
    outline: const Color(0xFF84746A),
  );

  /// Magenta Violet (Dark) Material 3 theme.
  static ThemeData get magentaViolet => _buildTheme(
    seedColor: const Color(0xFFA900A9),
    brightness: Brightness.dark,
    primary: const Color(0xFFFFABF3),
    primaryContainer: const Color(0xFF810081),
    secondary: const Color(0xFFDABFD2),
    secondaryContainer: const Color(0xFF554151),
    tertiary: const Color(0xFFD5BAFF),
    tertiaryContainer: const Color(0xFF5F00C0),
    surface: const Color(0xFF161215),
    surfaceContainerHighest: const Color(0xFF383337),
    onSurface: const Color(0xFFE9E0E4),
    outline: const Color(0xFF9A8D95),
  );

  /// Returns the [ThemeData] corresponding to [palette].
  static ThemeData byPalette(MagicPaletteName palette) => switch (palette) {
    MagicPaletteName.azureBlue => azureBlue,
    MagicPaletteName.lightTheme => lightTheme,
    MagicPaletteName.darkTheme => darkTheme,
    MagicPaletteName.roseRed => roseRed,
    MagicPaletteName.cyanOrange => cyanOrange,
    MagicPaletteName.orangeRed => orangeRed,
    MagicPaletteName.magentaViolet => magentaViolet,
  };

  /// Ordered map of all 7 Material 3 themes keyed by [MagicPaletteName].
  static Map<MagicPaletteName, ThemeData> get allThemes =>
      <MagicPaletteName, ThemeData>{
        for (final palette in MagicPaletteName.values)
          palette: byPalette(palette),
      };

  /// Resolves [intent] into a 4-role [MagicIntentColorSet] using the active
  /// [ThemeData.colorScheme] and [MagicSemanticColors] extension.
  ///
  /// Falls back safely to [MagicSemanticColors.forColorScheme] when a host
  /// application uses a custom [ThemeData] without the extension registered.
  static MagicIntentColorSet resolveIntent(
    BuildContext context,
    ColorIntent intent,
  ) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final semantic =
        theme.extension<MagicSemanticColors>() ??
        MagicSemanticColors.forColorScheme(scheme);

    return switch (intent) {
      ColorIntent.primary => MagicIntentColorSet(
        main: scheme.primary,
        onMain: scheme.onPrimary,
        container: scheme.primaryContainer,
        onContainer: scheme.onPrimaryContainer,
      ),
      ColorIntent.secondary => MagicIntentColorSet(
        main: scheme.secondary,
        onMain: scheme.onSecondary,
        container: scheme.secondaryContainer,
        onContainer: scheme.onSecondaryContainer,
      ),
      ColorIntent.tertiary => MagicIntentColorSet(
        main: scheme.tertiary,
        onMain: scheme.onTertiary,
        container: scheme.tertiaryContainer,
        onContainer: scheme.onTertiaryContainer,
      ),
      ColorIntent.success => MagicIntentColorSet(
        main: semantic.success,
        onMain: semantic.onSuccess,
        container: semantic.successContainer,
        onContainer: semantic.onSuccessContainer,
      ),
      ColorIntent.warning => MagicIntentColorSet(
        main: semantic.warning,
        onMain: semantic.onWarning,
        container: semantic.warningContainer,
        onContainer: semantic.onWarningContainer,
      ),
      ColorIntent.error => MagicIntentColorSet(
        main: scheme.error,
        onMain: scheme.onError,
        container: scheme.errorContainer,
        onContainer: scheme.onErrorContainer,
      ),
      ColorIntent.neutral => MagicIntentColorSet(
        main: semantic.neutral,
        onMain: semantic.onNeutral,
        container: semantic.neutralContainer,
        onContainer: semantic.onNeutralContainer,
      ),
    };
  }

  /// Returns the standardized [MagicSizeMetrics] for [size].
  static MagicSizeMetrics metricsFor(AtomicSize size) => switch (size) {
    AtomicSize.xs => const MagicSizeMetrics(
      height: 28,
      fontSize: 12,
      iconSize: 16,
      horizontalPadding: 12,
      verticalPadding: 4,
    ),
    AtomicSize.sm => const MagicSizeMetrics(
      height: 32,
      fontSize: 13,
      iconSize: 18,
      horizontalPadding: 14,
      verticalPadding: 6,
    ),
    AtomicSize.md => const MagicSizeMetrics(
      height: 40,
      fontSize: 14,
      iconSize: 18,
      horizontalPadding: 24,
      verticalPadding: 10,
    ),
    AtomicSize.lg => const MagicSizeMetrics(
      height: 48,
      fontSize: 16,
      iconSize: 22,
      horizontalPadding: 28,
      verticalPadding: 12,
    ),
    AtomicSize.xl => const MagicSizeMetrics(
      height: 56,
      fontSize: 18,
      iconSize: 24,
      horizontalPadding: 32,
      verticalPadding: 16,
    ),
  };

  /// Returns the explicit [BorderRadius] override for [shape], or `null` when
  /// [ButtonShape.standard] should defer to the Material 3 component default.
  static BorderRadius? borderRadiusFor(ButtonShape shape) => switch (shape) {
    ButtonShape.standard => null,
    ButtonShape.square => BorderRadius.zero,
    ButtonShape.rounded => const BorderRadius.all(Radius.circular(8)),
    ButtonShape.pill => const BorderRadius.all(Radius.circular(999)),
  };

  static ThemeData _buildTheme({
    required Color seedColor,
    required Brightness brightness,
    required Color primary,
    required Color primaryContainer,
    required Color secondary,
    required Color secondaryContainer,
    required Color tertiary,
    required Color tertiaryContainer,
    required Color surface,
    required Color surfaceContainerHighest,
    required Color onSurface,
    required Color outline,
  }) {
    final isDark = brightness == Brightness.dark;
    final baseScheme = ColorScheme.fromSeed(
      seedColor: seedColor,
      brightness: brightness,
    );

    final colorScheme = baseScheme.copyWith(
      primary: primary,
      primaryContainer: primaryContainer,
      secondary: secondary,
      secondaryContainer: secondaryContainer,
      tertiary: tertiary,
      tertiaryContainer: tertiaryContainer,
      surface: surface,
      surfaceContainerHighest: surfaceContainerHighest,
      onSurface: onSurface,
      outline: outline,
      error: isDark ? _darkError : _lightError,
      onError: isDark ? _darkOnError : _lightOnError,
      errorContainer: isDark ? _darkErrorContainer : _lightErrorContainer,
      onErrorContainer: isDark ? _darkOnErrorContainer : _lightOnErrorContainer,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: colorScheme.surface,
      extensions: <ThemeExtension<dynamic>>[
        MagicSemanticColors.forColorScheme(colorScheme),
      ],
    );
  }
}
