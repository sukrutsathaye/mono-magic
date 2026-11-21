import type {
  ButtonHTMLAttributes,
  MouseEventHandler,
  ReactNode,
  Ref,
} from 'react';
import Box from '@mui/material/Box';
import MuiButton, {
  type ButtonProps as MuiButtonProps,
} from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import MuiFab, { type FabProps as MuiFabProps } from '@mui/material/Fab';
import MuiIconButton from '@mui/material/IconButton';
import {
  alpha,
  useTheme,
  type CSSObject,
  type SxProps,
  type Theme,
} from '@mui/material/styles';
import type {
  AtomicSize,
  ButtonAtomProps,
  ButtonKind,
  ButtonShape,
  ButtonType,
  ButtonVariant,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import {
  MAGIC_SHAPE_RADIUS,
  MAGIC_SIZE_METRICS,
  resolveMagicIntentColors,
} from '../../theme/mui-theme';

/**
 * Slot-level HTML prop overrides for {@link MagicButton}.
 */
export interface MagicButtonSlotProps {
  /** Additional native attributes applied to the root `<button>` element. */
  root?: Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'color' | 'onClick' | 'type'
  >;
}

/**
 * Props for {@link MagicButton}, extending {@link ButtonAtomProps} with full
 * React 19 / MUI v9 ergonomics (`children`, ReactNode icons, `loadingLabel`,
 * `type`, `sx`, `slotProps`, and direct `ref` prop).
 */
export interface MagicButtonProps
  extends Omit<ButtonAtomProps, 'label' | 'leadingIcon' | 'trailingIcon'> {
  /** Visible text fallback used when `children` is not provided. */
  label?: string;
  /** Rich React content rendered inside the button; takes precedence over `label`. */
  children?: ReactNode;
  /** Native HTML button `type` attribute. Defaults to `'button'`. */
  type?: ButtonType;
  /** Optional text replacing the visible button content while `loading` is true. */
  loadingLabel?: string;
  /** Leading Material Icons name or custom React node (also the primary glyph for icon/FAB kinds). */
  leadingIcon?: string | ReactNode;
  /** Trailing Material Icons name or custom React node. */
  trailingIcon?: string | ReactNode;
  /** Click handler invoked when the button is activated and not disabled or loading. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Optional MUI `sx` overrides. */
  sx?: SxProps<Theme>;
  /** Optional slot-level attribute overrides forwarded to the root button element. */
  slotProps?: MagicButtonSlotProps;
  /** Optional CSS class name. */
  className?: string;
  /** React 19 ref forwarded directly to the underlying `<button>` element. */
  ref?: Ref<HTMLButtonElement>;
}

const MUI_BUTTON_VARIANT_MAP: Record<ButtonVariant, MuiButtonProps['variant']> =
  {
    filled: 'contained',
    tonal: 'contained',
    outlined: 'outlined',
    elevated: 'contained',
    text: 'text',
  };

const MUI_BUTTON_SIZE_MAP: Record<AtomicSize, MuiButtonProps['size']> = {
  xs: 'small',
  sm: 'small',
  md: 'medium',
  lg: 'large',
  xl: 'large',
};

const FAB_SIZE_MAP: Record<AtomicSize, MuiFabProps['size']> = {
  xs: 'small',
  sm: 'small',
  md: 'medium',
  lg: 'large',
  xl: 'large',
};

function resolveVariantSx(
  theme: Theme,
  variant: ButtonVariant,
  color: ColorIntent,
  kind: ButtonKind,
): CSSObject {
  const intent = resolveMagicIntentColors(theme, color);
  const surface = theme.palette.magic?.surface ?? theme.palette.background.paper;
  const isFab = kind === 'fab' || kind === 'mini-fab' || kind === 'extended-fab';
  const disabledStyles: CSSObject = {
    '&.Mui-disabled, &[aria-disabled="true"]': {
      color: theme.palette.action.disabled,
      backgroundColor:
        variant === 'outlined' || variant === 'text'
          ? 'transparent'
          : theme.palette.action.disabledBackground,
      borderColor:
        variant === 'outlined' ? theme.palette.action.disabled : undefined,
      boxShadow: 'none',
      cursor: 'not-allowed',
    },
  };

  switch (variant) {
    case 'tonal':
      return {
        backgroundColor: intent.container,
        color: intent.onContainer,
        boxShadow: isFab ? theme.shadows[3] : 'none',
        '&:hover': {
          backgroundColor: alpha(intent.container, 0.85),
          boxShadow: isFab ? theme.shadows[6] : 'none',
        },
        ...disabledStyles,
      };
    case 'outlined':
      return {
        backgroundColor: 'transparent',
        color: intent.main,
        border: `1px solid ${
          color === 'neutral' ? theme.palette.divider : alpha(intent.main, 0.5)
        }`,
        boxShadow: 'none',
        '&:hover': {
          borderColor: intent.main,
          backgroundColor: alpha(intent.main, 0.08),
          boxShadow: 'none',
        },
        ...disabledStyles,
      };
    case 'elevated':
      return {
        backgroundColor: surface,
        color: intent.main,
        boxShadow: theme.shadows[2],
        '&:hover': {
          backgroundColor: alpha(intent.main, 0.08),
          boxShadow: theme.shadows[4],
        },
        ...disabledStyles,
      };
    case 'text':
      return {
        backgroundColor: 'transparent',
        color: intent.main,
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: alpha(intent.main, 0.08),
          boxShadow: 'none',
        },
        ...disabledStyles,
      };
    case 'filled':
    default:
      return {
        backgroundColor: intent.main,
        color: intent.contrastText,
        boxShadow: isFab ? theme.shadows[3] : 'none',
        '&:hover': {
          backgroundColor: alpha(intent.main, 0.9),
          boxShadow: isFab ? theme.shadows[6] : 'none',
        },
        ...disabledStyles,
      };
  }
}

function resolveShapeRadius(shape: ButtonShape): string | undefined {
  const radius = MAGIC_SHAPE_RADIUS[shape];
  return radius !== undefined ? `${radius}px` : undefined;
}

function resolveIconAriaFallback(
  leadingIcon?: string | ReactNode,
  trailingIcon?: string | ReactNode,
): string | undefined {
  if (typeof leadingIcon === 'string' && leadingIcon.trim() !== '') {
    return leadingIcon.trim();
  }
  if (typeof trailingIcon === 'string' && trailingIcon.trim() !== '') {
    return trailingIcon.trim();
  }
  return undefined;
}

/**
 * Material 3 button atom unifying MUI's `Button`, `IconButton`, and `Fab`
 * behind a single cross-platform atomic design API.
 *
 * Supports all 5 variants (`filled`, `tonal`, `outlined`, `elevated`, `text`),
 * all 5 kinds (`default`, `icon`, `fab`, `mini-fab`, `extended-fab`),
 * all 4 shapes (`default`, `square`, `rounded`, `pill`), all 5 sizes (`xs`..`xl`),
 * all 7 semantic color intents, native loading states with optional `loadingLabel`,
 * `disabledInteractive` (`aria-disabled="true"`), and string or ReactNode icons.
 */
export function MagicButton({
  id,
  testId,
  ariaLabel,
  label,
  children,
  variant = 'filled',
  kind = 'default',
  shape = 'default',
  color = 'primary',
  size = 'md',
  disabled = false,
  disabledInteractive = false,
  disableRipple = false,
  loading = false,
  loadingLabel,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  type = 'button',
  onClick,
  sx,
  slotProps,
  className,
  ref,
}: MagicButtonProps) {
  const theme = useTheme();
  const metrics = MAGIC_SIZE_METRICS[size];
  const shapeRadius = resolveShapeRadius(shape);
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

  const isBlocked = disabled || loading;
  const isNativeDisabled = (disabled && !disabledInteractive) || loading;
  const isAriaDisabled = (disabled && disabledInteractive && !loading) || undefined;
  const variantSx = resolveVariantSx(theme, variant, color, kind);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (isBlocked) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  if (kind === 'icon') {
    const iconContent = leadingIcon ?? trailingIcon;
    const resolvedIconAria =
      ariaLabel ??
      (label && label.trim() !== '' ? label : undefined) ??
      resolveIconAriaFallback(leadingIcon, trailingIcon);

    return (
      <MuiIconButton
        {...slotProps?.root}
        ref={ref}
        id={id}
        data-testid={testId}
        aria-label={resolvedIconAria}
        aria-disabled={isAriaDisabled}
        aria-busy={loading || undefined}
        type={type}
        color={color}
        size={MUI_BUTTON_SIZE_MAP[size]}
        disabled={isNativeDisabled}
        disableRipple={disableRipple}
        loading={loading}
        className={className}
        onClick={handleClick}
        sx={[
          variantSx,
          {
            width: metrics.height,
            height: metrics.height,
            ...(shapeRadius !== undefined ? { borderRadius: shapeRadius } : {}),
          },
          ...extraSx,
        ]}
      >
        {iconContent !== undefined ? (
          <MagicIcon icon={iconContent} size={size} />
        ) : (
          children
        )}
      </MuiIconButton>
    );
  }

  if (kind === 'fab' || kind === 'mini-fab' || kind === 'extended-fab') {
    const isExtended = kind === 'extended-fab';
    const fabContent = children ?? label;
    const iconGlyph = leadingIcon ?? (!isExtended ? trailingIcon : undefined);
    const resolvedFabAria = isExtended
      ? ariaLabel
      : (ariaLabel ??
        (label && label.trim() !== '' ? label : undefined) ??
        resolveIconAriaFallback(leadingIcon, trailingIcon));
    const spinnerSize = kind === 'mini-fab' ? 16 : 20;

    return (
      <MuiFab
        {...slotProps?.root}
        ref={ref}
        id={id}
        data-testid={testId}
        aria-label={resolvedFabAria}
        aria-disabled={isAriaDisabled}
        aria-busy={loading || undefined}
        type={type}
        variant={isExtended ? 'extended' : 'circular'}
        size={kind === 'mini-fab' ? 'small' : FAB_SIZE_MAP[size]}
        color={color}
        disabled={isNativeDisabled}
        disableRipple={disableRipple}
        className={className}
        onClick={handleClick}
        sx={[
          variantSx,
          {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: metrics.fontSize,
            ...(isExtended
              ? {
                  gap: 1,
                  minHeight: metrics.height,
                  px: `${metrics.horizontalPadding}px`,
                }
              : {}),
            ...(shapeRadius !== undefined ? { borderRadius: shapeRadius } : {}),
          },
          ...extraSx,
        ]}
      >
        {loading ? (
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CircularProgress size={spinnerSize} color="inherit" />
            {isExtended ? (loadingLabel ?? fabContent) : null}
          </Box>
        ) : isExtended ? (
          <>
            {leadingIcon !== undefined ? (
              <MagicIcon icon={leadingIcon} size={size} />
            ) : null}
            {fabContent}
            {trailingIcon !== undefined ? (
              <MagicIcon icon={trailingIcon} size={size} />
            ) : null}
          </>
        ) : iconGlyph !== undefined ? (
          <MagicIcon icon={iconGlyph} size={size} />
        ) : (
          fabContent
        )}
      </MuiFab>
    );
  }

  const baseContent = children ?? label;
  const visibleContent = loading && loadingLabel ? loadingLabel : baseContent;
  const hasLoadingLabel = Boolean(loading && loadingLabel);
  const startIconNode =
    leadingIcon !== undefined && !hasLoadingLabel ? (
      <MagicIcon icon={leadingIcon} size={size} />
    ) : undefined;
  const endIconNode =
    trailingIcon !== undefined ? (
      <MagicIcon icon={trailingIcon} size={size} />
    ) : undefined;

  return (
    <MuiButton
      {...slotProps?.root}
      ref={ref}
      id={id}
      data-testid={testId}
      aria-label={ariaLabel}
      aria-disabled={isAriaDisabled}
      aria-busy={loading || undefined}
      type={type}
      variant={MUI_BUTTON_VARIANT_MAP[variant]}
      color={color}
      size={MUI_BUTTON_SIZE_MAP[size]}
      disabled={isNativeDisabled}
      disableRipple={disableRipple}
      disableElevation={variant !== 'elevated'}
      loading={loading}
      loadingPosition={hasLoadingLabel ? 'start' : 'center'}
      fullWidth={fullWidth}
      startIcon={startIconNode}
      endIcon={endIconNode}
      className={className}
      onClick={handleClick}
      sx={[
        variantSx,
        {
          minHeight: metrics.height,
          fontSize: metrics.fontSize,
          px: `${metrics.horizontalPadding}px`,
          ...(shapeRadius !== undefined ? { borderRadius: shapeRadius } : {}),
        },
        ...extraSx,
      ]}
    >
      {visibleContent}
    </MuiButton>
  );
}
