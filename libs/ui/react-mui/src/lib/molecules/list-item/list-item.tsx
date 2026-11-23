import type { MouseEvent, ReactNode, Ref } from 'react';
import Box from '@mui/material/Box';
import MuiListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme, type SxProps, type Theme } from '@mui/material/styles';
import type {
  AtomicSize,
  ListItemAppearance,
  ListItemMoleculeProps,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import { resolveMagicIntentColors } from '../../theme/mui-theme';
import { MagicAvatar } from '../avatar/avatar';

/**
 * Props for {@link MagicListItem}, extending {@link ListItemMoleculeProps}
 * with controlled/uncontrolled selection callbacks, custom leading/trailing slots,
 * and React 19 / MUI v9 styling ergonomics.
 */
export interface MagicListItemProps extends ListItemMoleculeProps {
  /** Initial selected state for uncontrolled `selectable` usage. */
  defaultSelected?: boolean;
  /** Invoked when an interactive or selectable list item is activated. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Invoked when a `selectable` list item toggles its selected state. */
  onSelectedChange?: (selected: boolean) => void;
  /** Optional custom React node rendered in the leading slot instead of icon/avatar props. */
  leadingSlot?: ReactNode;
  /** Optional custom React node rendered in the trailing slot alongside or instead of trailing props. */
  trailingSlot?: ReactNode;
  /** Optional MUI `sx` overrides applied to the root `ListItem`. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name applied to the root `ListItem`. */
  className?: string;
  /** React 19 ref forwarded directly to the root `<li>` element. */
  ref?: Ref<HTMLLIElement>;
}

const LIST_ITEM_SIZE_METRICS: Record<
  AtomicSize,
  {
    minHeight: number;
    px: number;
    py: number;
    primarySize: number;
    secondarySize: number;
    overlineSize: number;
    iconSize: AtomicSize;
    avatarSize: AtomicSize;
  }
> = {
  xs: {
    minHeight: 36,
    px: 1.25,
    py: 0.5,
    primarySize: 13,
    secondarySize: 11,
    overlineSize: 10,
    iconSize: 'xs',
    avatarSize: 'xs',
  },
  sm: {
    minHeight: 44,
    px: 1.5,
    py: 0.75,
    primarySize: 14,
    secondarySize: 12,
    overlineSize: 10,
    iconSize: 'sm',
    avatarSize: 'sm',
  },
  md: {
    minHeight: 52,
    px: 2,
    py: 1,
    primarySize: 15,
    secondarySize: 13,
    overlineSize: 11,
    iconSize: 'md',
    avatarSize: 'sm',
  },
  lg: {
    minHeight: 60,
    px: 2.25,
    py: 1.25,
    primarySize: 16,
    secondarySize: 14,
    overlineSize: 11,
    iconSize: 'lg',
    avatarSize: 'md',
  },
  xl: {
    minHeight: 68,
    px: 2.5,
    py: 1.5,
    primarySize: 18,
    secondarySize: 15,
    overlineSize: 12,
    iconSize: 'xl',
    avatarSize: 'lg',
  },
};

function resolveAppearanceStyles(
  theme: Theme,
  appearance: ListItemAppearance,
  isSelected: boolean,
  color: NonNullable<ListItemMoleculeProps['color']>,
) {
  const intent = resolveMagicIntentColors(theme, color);
  const outlineColor = theme.palette.magic?.outline ?? theme.palette.divider;
  const surfaceHighest =
    theme.palette.magic?.surfaceContainerHighest ??
    theme.palette.action.hover;

  if (appearance === 'outlined') {
    return {
      border: `1px solid ${isSelected ? intent.main : outlineColor}`,
      borderRadius: 2,
      backgroundColor: isSelected
        ? alpha(intent.container, 0.45)
        : theme.palette.background.paper,
      color: isSelected ? intent.onContainer : theme.palette.text.primary,
    };
  }

  if (appearance === 'filled') {
    return {
      border: `1px solid ${isSelected ? intent.main : 'transparent'}`,
      borderRadius: 2,
      backgroundColor: isSelected ? intent.container : surfaceHighest,
      color: isSelected ? intent.onContainer : theme.palette.text.primary,
    };
  }

  return {
    border: 'none',
    borderRadius: 1,
    backgroundColor: isSelected ? alpha(intent.container, 0.45) : 'transparent',
    color: isSelected ? intent.onContainer : theme.palette.text.primary,
  };
}

/**
 * Material 3 list row molecule composing MUI v9 `ListItem`, `ListItemButton`,
 * `ListItemText`, `ListItemIcon`, `ListItemAvatar`, {@link MagicAvatar}, and
 * {@link MagicIcon}.
 *
 * Supports leading avatars/icons, overline/primary/secondary typography,
 * trailing metadata/badges/icons, `standard`/`outlined`/`filled` appearances,
 * controlled/uncontrolled `selectable` toggling, `dense` padding, and `divider`.
 */
export function MagicListItem({
  id,
  testId,
  ariaLabel,
  primaryText,
  secondaryText,
  overlineText,
  leadingIcon,
  leadingAvatarText,
  leadingAvatarSrc,
  trailingIcon,
  trailingText,
  trailingBadge,
  interactive = false,
  selectable = false,
  selected,
  defaultSelected = false,
  disabled = false,
  divider = false,
  dense = false,
  color = 'primary',
  size = 'md',
  appearance = 'standard',
  leadingSlot,
  trailingSlot,
  onClick,
  onSelectedChange,
  sx,
  className,
  ref,
}: MagicListItemProps) {
  const theme = useTheme();
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const metric = LIST_ITEM_SIZE_METRICS[size];
  const intent = resolveMagicIntentColors(theme, color);

  const [currentSelected, setCurrentSelected] = useControllableState<boolean>({
    value: selected,
    defaultValue: defaultSelected,
    onChange: onSelectedChange,
  });

  const isSelected = Boolean(currentSelected);
  const isActionable = Boolean(interactive || selectable || onClick);
  const surfaceStyles = resolveAppearanceStyles(
    theme,
    appearance,
    isSelected,
    color,
  );

  const handleActivate = (event: MouseEvent<HTMLElement>) => {
    if (disabled) {
      return;
    }
    if (selectable) {
      setCurrentSelected((prev) => !prev);
    }
    onClick?.(event);
  };

  const hasAvatar = Boolean(leadingAvatarSrc || leadingAvatarText);
  const leadingContent = leadingSlot ? (
    <Box
      data-testid={testId ? `${testId}-leading` : undefined}
      sx={{ display: 'inline-flex', alignItems: 'center', mr: 1.5, flexShrink: 0 }}
    >
      {leadingSlot}
    </Box>
  ) : hasAvatar ? (
    <ListItemAvatar sx={{ minWidth: 'auto', mr: 1.5 }}>
      <MagicAvatar
        src={leadingAvatarSrc}
        initials={leadingAvatarText}
        alt={primaryText}
        size={metric.avatarSize}
        color={color}
        testId={testId ? `${testId}-avatar` : undefined}
      />
    </ListItemAvatar>
  ) : leadingIcon ? (
    <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
      <MagicIcon
        icon={leadingIcon}
        size={metric.iconSize}
        color={disabled ? 'inherit' : isSelected ? color : 'neutral'}
        testId={testId ? `${testId}-leading-icon` : undefined}
      />
    </ListItemIcon>
  ) : null;

  const hasTrailing = Boolean(
    trailingSlot ||
      trailingText !== undefined ||
      trailingBadge !== undefined ||
      trailingIcon,
  );

  const trailingContent = hasTrailing ? (
    <Stack
      direction="row"
      spacing={1}
      data-testid={testId ? `${testId}-trailing` : undefined}
      sx={{ ml: 1.5, flexShrink: 0, alignItems: 'center' }}
    >
      {trailingText !== undefined ? (
        <Typography
          component="span"
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: metric.secondarySize }}
        >
          {trailingText}
        </Typography>
      ) : null}
      {trailingBadge !== undefined ? (
        <Box
          component="span"
          data-testid={testId ? `${testId}-trailing-badge` : undefined}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 20,
            height: 20,
            px: 0.75,
            borderRadius: 9999,
            backgroundColor: intent.main,
            color: intent.contrastText,
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          {trailingBadge}
        </Box>
      ) : null}
      {trailingIcon ? (
        <MagicIcon
          icon={trailingIcon}
          size={metric.iconSize}
          color={disabled ? 'inherit' : isSelected ? color : 'neutral'}
          testId={testId ? `${testId}-trailing-icon` : undefined}
        />
      ) : null}
      {trailingSlot}
    </Stack>
  ) : null;

  const textBlock = (
    <ListItemText
      sx={{ my: 0, minWidth: 0, flex: 1 }}
      slotProps={{
        primary: { component: 'div' },
        secondary: { component: 'div' },
      }}
      primary={
        <Box sx={{ minWidth: 0 }}>
          {overlineText ? (
            <Typography
              component="div"
              variant="overline"
              color="text.secondary"
              sx={{
                display: 'block',
                fontSize: metric.overlineSize,
                lineHeight: 1.2,
                letterSpacing: 0.6,
                mb: 0.25,
              }}
            >
              {overlineText}
            </Typography>
          ) : null}
          <Typography
            component="div"
            variant="body1"
            sx={{
              fontSize: metric.primarySize,
              fontWeight: isSelected ? 600 : 500,
              lineHeight: 1.35,
            }}
          >
            {primaryText}
          </Typography>
        </Box>
      }
      secondary={
        secondaryText ? (
          <Typography
            component="div"
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: metric.secondarySize,
              lineHeight: 1.35,
              mt: 0.25,
            }}
          >
            {secondaryText}
          </Typography>
        ) : undefined
      }
    />
  );

  const innerContent = (
    <>
      {leadingContent}
      {textBlock}
      {trailingContent}
    </>
  );

  const verticalPad = dense ? Math.max(0.25, metric.py - 0.35) : metric.py;
  const resolvedMinHeight = dense
    ? Math.max(32, metric.minHeight - 8)
    : metric.minHeight;

  return (
    <MuiListItem
      ref={ref}
      id={id}
      disablePadding={isActionable}
      divider={divider && appearance === 'standard'}
      data-testid={testId}
      data-appearance={appearance}
      data-size={size}
      data-selected={isSelected ? 'true' : 'false'}
      data-disabled={disabled ? 'true' : 'false'}
      aria-label={!isActionable ? ariaLabel : undefined}
      className={className}
      sx={[
        {
          overflow: 'hidden',
          opacity: disabled ? 0.52 : 1,
          ...surfaceStyles,
          ...(isActionable
            ? {}
            : {
                minHeight: resolvedMinHeight,
                px: metric.px,
                py: verticalPad,
                display: 'flex',
                alignItems: 'center',
              }),
        },
        ...extraSx,
      ]}
    >
      {isActionable ? (
        <ListItemButton
          selected={isSelected}
          disabled={disabled}
          dense={dense}
          aria-label={ariaLabel}
          aria-pressed={selectable ? isSelected : undefined}
          onClick={handleActivate}
          data-testid={testId ? `${testId}-button` : undefined}
          sx={{
            minHeight: resolvedMinHeight,
            px: metric.px,
            py: verticalPad,
            borderRadius: 'inherit',
            '&.Mui-selected': {
              backgroundColor: 'transparent',
            },
            '&.Mui-selected:hover': {
              backgroundColor: alpha(intent.main, 0.08),
            },
          }}
        >
          {innerContent}
        </ListItemButton>
      ) : (
        innerContent
      )}
    </MuiListItem>
  );
}
