import type { MouseEvent, Ref } from 'react';
import Box from '@mui/material/Box';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import type {
  AtomicSize,
  BreadcrumbItem,
  BreadcrumbsMoleculeProps,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { resolveMagicIntentColors } from '../../theme/mui-theme';

/**
 * Props for {@link MagicBreadcrumbs}, extending {@link BreadcrumbsMoleculeProps}
 * with React 19 / MUI v9 item selection callbacks and styling props.
 */
export interface MagicBreadcrumbsProps extends BreadcrumbsMoleculeProps {
  /** Invoked when a non-disabled, non-current breadcrumb item is activated. */
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  /** Optional MUI `sx` overrides applied to the root `Breadcrumbs` `<nav>` element. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name applied to the root `Breadcrumbs` `<nav>` element. */
  className?: string;
  /** React 19 ref forwarded directly to the root `<nav>` element. */
  ref?: Ref<HTMLElement>;
}

const BREADCRUMB_SIZE_STYLES: Record<
  AtomicSize,
  { fontSize: number; iconSize: AtomicSize; gap: number }
> = {
  xs: { fontSize: 12, iconSize: 'xs', gap: 0.5 },
  sm: { fontSize: 13, iconSize: 'xs', gap: 0.5 },
  md: { fontSize: 14, iconSize: 'sm', gap: 0.75 },
  lg: { fontSize: 16, iconSize: 'md', gap: 0.75 },
  xl: { fontSize: 18, iconSize: 'lg', gap: 1 },
};

const SEPARATOR_ICON_NAMES = new Set([
  'chevron_right',
  'navigate_next',
  'arrow_forward_ios',
  'double_arrow',
]);

/**
 * Material 3 navigational breadcrumbs molecule composing MUI v9 `Breadcrumbs`,
 * `Link`, `Typography`, and {@link MagicIcon}.
 *
 * Supports custom string or icon-token `separator`, `maxItems` collapse/expand,
 * leading item icons, `aria-current="page"` on the active trailing segment,
 * individual/global `disabled` states, all 5 atomic sizes, and all 7 `ColorIntent`s.
 */
export function MagicBreadcrumbs({
  id,
  testId,
  ariaLabel,
  items,
  separator = '/',
  maxItems,
  itemsBeforeCollapse = 1,
  itemsAfterCollapse = 1,
  color = 'primary',
  size = 'md',
  disabled = false,
  onItemClick,
  sx,
  className,
  ref,
}: MagicBreadcrumbsProps) {
  const theme = useTheme();
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const sizeStyle = BREADCRUMB_SIZE_STYLES[size];
  const intent = resolveMagicIntentColors(theme, color);

  const resolvedSeparator = SEPARATOR_ICON_NAMES.has(separator) ? (
    <MagicIcon icon={separator} size={sizeStyle.iconSize} color="neutral" />
  ) : (
    <Box
      component="span"
      sx={{ fontSize: sizeStyle.fontSize, color: 'text.secondary' }}
    >
      {separator}
    </Box>
  );

  return (
    <MuiBreadcrumbs
      ref={ref}
      id={id}
      data-testid={testId}
      data-size={size}
      data-disabled={disabled ? 'true' : 'false'}
      aria-label={ariaLabel ?? 'Breadcrumb'}
      separator={resolvedSeparator}
      maxItems={maxItems}
      itemsBeforeCollapse={itemsBeforeCollapse}
      itemsAfterCollapse={itemsAfterCollapse}
      className={className}
      sx={[
        {
          opacity: disabled ? 0.55 : 1,
          '& .MuiBreadcrumbs-separator': {
            mx: 0.75,
          },
        },
        ...extraSx,
      ]}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isCurrent = Boolean(item.current ?? isLast);
        const isItemDisabled = Boolean(disabled || item.disabled);
        const itemTestId = testId ? `${testId}-item-${item.id}` : undefined;

        const labelNode = (
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: sizeStyle.gap,
            }}
          >
            {item.icon ? (
              <MagicIcon
                icon={item.icon}
                size={sizeStyle.iconSize}
                color={isCurrent || isItemDisabled ? 'inherit' : color}
              />
            ) : null}
            <span>{item.label}</span>
          </Box>
        );

        if (isCurrent) {
          return (
            <Typography
              key={item.id}
              component="span"
              aria-current="page"
              data-testid={itemTestId}
              sx={{
                fontSize: sizeStyle.fontSize,
                fontWeight: 600,
                color: theme.palette.text.primary,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {labelNode}
            </Typography>
          );
        }

        if (isItemDisabled) {
          return (
            <Typography
              key={item.id}
              component="span"
              aria-disabled="true"
              data-testid={itemTestId}
              sx={{
                fontSize: sizeStyle.fontSize,
                color: theme.palette.text.disabled,
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'not-allowed',
              }}
            >
              {labelNode}
            </Typography>
          );
        }

        const handleClick = (event: MouseEvent<HTMLElement>) => {
          if (!item.href) {
            event.preventDefault();
          }
          onItemClick?.(item, index);
        };

        if (item.href) {
          return (
            <Link
              key={item.id}
              href={item.href}
              underline="hover"
              data-testid={itemTestId}
              onClick={handleClick}
              sx={{
                fontSize: sizeStyle.fontSize,
                fontWeight: 500,
                color: intent.main,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {labelNode}
            </Link>
          );
        }

        return (
          <Link
            key={item.id}
            component="button"
            type="button"
            underline="hover"
            data-testid={itemTestId}
            onClick={handleClick}
            sx={{
              fontSize: sizeStyle.fontSize,
              fontWeight: 500,
              color: intent.main,
              display: 'inline-flex',
              alignItems: 'center',
              border: 'none',
              background: 'none',
              p: 0,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {labelNode}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
}
