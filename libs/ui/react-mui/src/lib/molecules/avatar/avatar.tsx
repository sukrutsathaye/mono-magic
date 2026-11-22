import { useEffect, useState, type ReactNode, type Ref } from 'react';
import MuiAvatar from '@mui/material/Avatar';
import MuiAvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import type {
  AtomicSize,
  AvatarGroupMoleculeProps,
  AvatarGroupSpacing,
  AvatarMoleculeProps,
  AvatarShape,
  AvatarStatus,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { resolveMagicIntentColors } from '../../theme/mui-theme';

/**
 * Props for {@link MagicAvatar}, extending {@link AvatarMoleculeProps} with
 * React 19 / MUI v9 image load error handling, custom children, and styling.
 */
export interface MagicAvatarProps extends AvatarMoleculeProps {
  /** Optional custom React content overriding initials/icon fallback. */
  children?: ReactNode;
  /** Optional callback invoked if the `src` image fails to load. */
  onImageError?: () => void;
  /** Optional MUI `sx` overrides applied to the outer wrapper `Box`. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name applied to the outer wrapper `Box`. */
  className?: string;
  /** React 19 ref forwarded directly to the outer wrapper `<div>` element. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * Props for {@link MagicAvatarGroup}, extending {@link AvatarGroupMoleculeProps}
 * with item click interaction and MUI styling.
 */
export interface MagicAvatarGroupProps extends AvatarGroupMoleculeProps {
  /** Invoked when a visible avatar in the group is clicked. */
  onAvatarClick?: (item: AvatarGroupMoleculeProps['items'][number], index: number) => void;
  /** Optional MUI `sx` overrides applied to the root `AvatarGroup`. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name applied to the root `AvatarGroup`. */
  className?: string;
  /** React 19 ref forwarded directly to the root `AvatarGroup` `<div>` element. */
  ref?: Ref<HTMLDivElement>;
}

const AVATAR_SIZE_METRICS: Record<
  AtomicSize,
  { dim: number; fontSize: number; iconSize: AtomicSize; dotSize: number }
> = {
  xs: { dim: 24, fontSize: 10, iconSize: 'xs', dotSize: 7 },
  sm: { dim: 32, fontSize: 12, iconSize: 'sm', dotSize: 8 },
  md: { dim: 40, fontSize: 14, iconSize: 'md', dotSize: 10 },
  lg: { dim: 48, fontSize: 16, iconSize: 'lg', dotSize: 12 },
  xl: { dim: 64, fontSize: 22, iconSize: 'xl', dotSize: 14 },
};

const SHAPE_RADIUS_MAP: Record<AvatarShape, string> = {
  circle: '50%',
  rounded: '10px',
  square: '4px',
};

const GROUP_SPACING_MAP: Record<AvatarGroupSpacing, number> = {
  tight: 12,
  normal: 6,
};

/**
 * Derives 1-2 uppercase initials from a person or workspace display name.
 */
export function computeAvatarInitials(name?: string): string {
  if (!name) {
    return '';
  }
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);
  if (parts.length === 0) {
    return '';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function resolveStatusColor(theme: Theme, status: AvatarStatus): string {
  if (status === 'online') {
    return theme.palette.success.main;
  }
  if (status === 'busy') {
    return theme.palette.error.main;
  }
  return theme.palette.text.disabled;
}

/**
 * Material 3 avatar molecule composing MUI v9 `Avatar`, deterministic
 * fallback chain (`src` -> `initials` / derived `name` -> `icon` -> `'person'`),
 * `shape` geometry, `ColorIntent` container styling, and optional `status` badge.
 */
export function MagicAvatar({
  id,
  testId,
  ariaLabel,
  src,
  alt,
  name,
  initials,
  icon,
  size = 'md',
  color = 'primary',
  shape = 'circle',
  status,
  statusLabel,
  children,
  onImageError,
  sx,
  className,
  ref,
}: MagicAvatarProps) {
  const theme = useTheme();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const metric = AVATAR_SIZE_METRICS[size];
  const intent = resolveMagicIntentColors(theme, color);
  const borderRadius = SHAPE_RADIUS_MAP[shape];
  const muiVariant =
    shape === 'circle' ? 'circular' : shape === 'rounded' ? 'rounded' : 'square';

  const trimmedInitials = initials?.trim() || computeAvatarInitials(name);
  const showImage = Boolean(src && !imageFailed);
  const resolvedAlt = alt ?? name ?? 'Avatar';
  const resolvedAria = ariaLabel ?? name ?? alt;

  const fallbackNode = children ?? (
    trimmedInitials ? (
      trimmedInitials
    ) : (
      <MagicIcon icon={icon || 'person'} size={metric.iconSize} color="inherit" />
    )
  );

  return (
    <Box
      ref={ref}
      id={id}
      data-testid={testId}
      data-size={size}
      data-shape={shape}
      data-color={color}
      aria-label={resolvedAria}
      className={className}
      sx={[
        {
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          verticalAlign: 'middle',
          flexShrink: 0,
        },
        ...extraSx,
      ]}
    >
      <MuiAvatar
        src={showImage ? src : undefined}
        alt={showImage ? resolvedAlt : undefined}
        variant={muiVariant}
        data-testid={testId ? `${testId}-surface` : undefined}
        slotProps={
          showImage
            ? {
                img: {
                  onError: () => {
                    setImageFailed(true);
                    onImageError?.();
                  },
                },
              }
            : undefined
        }
        sx={{
          width: metric.dim,
          height: metric.dim,
          fontSize: metric.fontSize,
          fontWeight: 600,
          borderRadius,
          backgroundColor: showImage ? 'transparent' : intent.container,
          color: intent.onContainer,
          border: `1px solid ${theme.palette.background.paper}`,
        }}
      >
        {showImage ? null : fallbackNode}
      </MuiAvatar>

      {status ? (
        <Box
          component="span"
          role="img"
          aria-label={statusLabel ?? `Status: ${status}`}
          data-testid={testId ? `${testId}-status` : undefined}
          data-status={status}
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: metric.dotSize,
            height: metric.dotSize,
            borderRadius: '50%',
            backgroundColor: resolveStatusColor(theme, status),
            border: `2px solid ${theme.palette.background.paper}`,
            boxSizing: 'border-box',
          }}
        />
      ) : null}
    </Box>
  );
}

/**
 * Material 3 stacked avatar group molecule rendering {@link MagicAvatar} items
 * with configurable `spacing` (`tight` / `normal`) and `max` overflow `+N` indicator.
 */
export function MagicAvatarGroup({
  id,
  testId,
  ariaLabel,
  items,
  max,
  size = 'md',
  spacing = 'normal',
  onAvatarClick,
  sx,
  className,
  ref,
}: MagicAvatarGroupProps) {
  const theme = useTheme();
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const metric = AVATAR_SIZE_METRICS[size];
  const overlap = GROUP_SPACING_MAP[spacing];

  const hasOverflow = typeof max === 'number' && max >= 0 && items.length > max;
  const visibleItems = hasOverflow ? items.slice(0, max) : items;
  const overflowCount = hasOverflow ? items.length - max : 0;
  const neutralIntent = resolveMagicIntentColors(theme, 'neutral');

  return (
    <MuiAvatarGroup
      ref={ref}
      id={id}
      data-testid={testId}
      data-spacing={spacing}
      aria-label={ariaLabel ?? 'Avatar group'}
      spacing={overlap}
      className={className}
      sx={[
        {
          display: 'inline-flex',
          flexDirection: 'row',
          alignItems: 'center',
          '& > .MuiAvatar-root, & > div': {
            marginLeft: `-${overlap}px`,
            '&:last-child': {
              marginLeft: 0,
            },
          },
        },
        ...extraSx,
      ]}
    >
      {overflowCount > 0 ? (
        <MuiAvatar
          data-testid={testId ? `${testId}-overflow` : undefined}
          aria-label={`${overflowCount} more`}
          sx={{
            width: metric.dim,
            height: metric.dim,
            fontSize: metric.fontSize,
            fontWeight: 700,
            backgroundColor: neutralIntent.container,
            color: neutralIntent.onContainer,
            border: `2px solid ${theme.palette.background.paper}`,
          }}
        >
          {`+${overflowCount}`}
        </MuiAvatar>
      ) : null}

      {[...visibleItems].reverse().map((item, reversedIdx) => {
        const originalIndex = visibleItems.length - 1 - reversedIdx;
        return (
          <Box
            key={item.id ?? `${item.name ?? item.initials ?? 'avatar'}-${originalIndex}`}
            onClick={
              onAvatarClick ? () => onAvatarClick(item, originalIndex) : undefined
            }
            sx={{
              display: 'inline-flex',
              cursor: onAvatarClick ? 'pointer' : 'default',
            }}
          >
            <MagicAvatar
              {...item}
              size={size}
              testId={
                item.testId ??
                (testId ? `${testId}-item-${item.id ?? originalIndex}` : undefined)
              }
            />
          </Box>
        );
      })}
    </MuiAvatarGroup>
  );
}
