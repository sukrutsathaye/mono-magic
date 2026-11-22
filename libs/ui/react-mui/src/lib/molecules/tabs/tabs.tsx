import { useEffect, useId, useState, type ReactNode, type Ref, type SyntheticEvent } from 'react';
import Box from '@mui/material/Box';
import MuiTab from '@mui/material/Tab';
import MuiTabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { alpha, useTheme, type SxProps, type Theme } from '@mui/material/styles';
import type {
  AtomicSize,
  TabItem,
  TabsMoleculeProps,
} from '@mono-magic/atomic-design-interfaces';
import { MagicBadge } from '../../atoms/badge/badge';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import {
  MAGIC_SIZE_METRICS,
  resolveMagicIntentColors,
} from '../../theme/mui-theme';

/**
 * Props for {@link MagicTabs}, extending {@link TabsMoleculeProps} with
 * React 19 / MUI v9 tab change callbacks, custom panel rendering, and styling.
 */
export interface MagicTabsProps extends TabsMoleculeProps {
  /** Invoked whenever the active tab selection changes. */
  onTabChange?: (tabId: string, item: TabItem) => void;
  /** Optional custom renderer for tab panel bodies, taking precedence over `item.content`. */
  renderPanel?: (item: TabItem, isActive: boolean) => ReactNode;
  /** Optional MUI `sx` overrides applied to the outer container `Box`. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name applied to the outer container `Box`. */
  className?: string;
  /** React 19 ref forwarded directly to the outer container `<div>` element. */
  ref?: Ref<HTMLDivElement>;
}

function resolveDefaultTabId(
  items: readonly TabItem[],
  defaultActiveTabId?: string,
): string {
  if (
    defaultActiveTabId !== undefined &&
    items.some((item) => item.id === defaultActiveTabId)
  ) {
    return defaultActiveTabId;
  }
  const firstEnabled = items.find((item) => !item.disabled);
  return firstEnabled?.id ?? items[0]?.id ?? '';
}

const TAB_DENSITY_PADDING: Record<AtomicSize, { px: number; py: number }> = {
  xs: { px: 1.25, py: 0.5 },
  sm: { px: 1.5, py: 0.75 },
  md: { px: 2, py: 1 },
  lg: { px: 2.5, py: 1.25 },
  xl: { px: 3, py: 1.5 },
};

/**
 * Material 3 tabbed navigation and panel container molecule composing MUI v9
 * `Tabs` / `Tab`, {@link MagicIcon}, {@link MagicBadge}, and accessible
 * `role="tabpanel"` regions.
 *
 * Supports controlled and uncontrolled selection via `useControllableState`,
 * `horizontal`/`vertical` orientations, `primary`/`secondary` M3 indicator styles,
 * `scrollable` strips, `lazy` panel mounting, and all 7 `ColorIntent` palettes.
 */
export function MagicTabs({
  id,
  testId,
  ariaLabel,
  items,
  activeTabId,
  defaultActiveTabId,
  orientation = 'horizontal',
  variant = 'primary',
  scrollable = false,
  lazy = false,
  color = 'primary',
  size = 'md',
  onTabChange,
  renderPanel,
  sx,
  className,
  ref,
}: MagicTabsProps) {
  const theme = useTheme();
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const metrics = MAGIC_SIZE_METRICS[size];
  const density = TAB_DENSITY_PADDING[size];
  const intent = resolveMagicIntentColors(theme, color);
  const outlineColor = theme.palette.magic?.outline ?? theme.palette.divider;

  const initialTabId = resolveDefaultTabId(items, defaultActiveTabId);
  const [selectedId, setSelectedId] = useControllableState<string>({
    value: activeTabId,
    defaultValue: initialTabId,
    onChange: (nextId) => {
      const matched = items.find((item) => item.id === nextId);
      if (matched) {
        onTabChange?.(nextId, matched);
      }
    },
  });

  const [mountedIds, setMountedIds] = useState<ReadonlySet<string>>(() =>
    selectedId ? new Set([selectedId]) : new Set(),
  );

  useEffect(() => {
    if (selectedId) {
      setMountedIds((prev) => {
        if (prev.has(selectedId)) {
          return prev;
        }
        const next = new Set(prev);
        next.add(selectedId);
        return next;
      });
    }
  }, [selectedId]);

  const effectiveActiveId = items.some((item) => item.id === selectedId)
    ? selectedId
    : (items[0]?.id ?? false);

  const isVertical = orientation === 'vertical';
  const isPrimary = variant === 'primary';

  const handleChange = (_event: SyntheticEvent, nextValue: string) => {
    const matched = items.find((item) => item.id === nextValue);
    if (matched && !matched.disabled) {
      setSelectedId(nextValue);
    }
  };

  return (
    <Box
      ref={ref}
      id={id}
      data-testid={testId}
      data-orientation={orientation}
      data-variant={variant}
      className={className}
      sx={[
        {
          display: 'flex',
          flexDirection: isVertical ? 'row' : 'column',
          width: '100%',
        },
        ...extraSx,
      ]}
    >
      <MuiTabs
        value={effectiveActiveId}
        onChange={handleChange}
        orientation={orientation}
        variant={scrollable ? 'scrollable' : 'standard'}
        scrollButtons={scrollable ? 'auto' : false}
        aria-label={ariaLabel ?? 'Navigation tabs'}
        data-testid={testId ? `${testId}-tablist` : undefined}
        sx={{
          minHeight: metrics.height,
          flexShrink: 0,
          borderBottom: isVertical ? 'none' : `1px solid ${outlineColor}`,
          borderRight: isVertical ? `1px solid ${outlineColor}` : 'none',
          '& .MuiTabs-indicator': {
            backgroundColor: intent.main,
            ...(isVertical
              ? { width: isPrimary ? 3 : 2 }
              : {
                  height: isPrimary ? 3 : 2,
                  borderTopLeftRadius: isPrimary ? 3 : 0,
                  borderTopRightRadius: isPrimary ? 3 : 0,
                }),
          },
        }}
      >
        {items.map((item) => {
          const tabDomId = `${baseId}-tab-${item.id}`;
          const panelDomId = `${baseId}-panel-${item.id}`;
          const isSelected = item.id === effectiveActiveId;
          const showStackedPrimary =
            isPrimary && !isVertical && Boolean(item.icon);

          const labelContent = (
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                flexDirection: showStackedPrimary ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: showStackedPrimary ? 0.5 : 1,
              }}
            >
              {item.icon ? (
                <MagicIcon
                  icon={item.icon}
                  size={size}
                  color={isSelected ? color : 'inherit'}
                />
              ) : null}
              <Box component="span">{item.label}</Box>
              {item.badgeContent !== undefined ? (
                <MagicBadge
                  content={item.badgeContent}
                  color={color}
                  size="xs"
                  overlap={false}
                  testId={testId ? `${testId}-badge-${item.id}` : undefined}
                >
                  <Box component="span" sx={{ display: 'none' }} />
                </MagicBadge>
              ) : null}
            </Box>
          );

          return (
            <MuiTab
              key={item.id}
              id={tabDomId}
              value={item.id}
              disabled={item.disabled ?? false}
              aria-controls={panelDomId}
              data-testid={testId ? `${testId}-tab-${item.id}` : undefined}
              label={labelContent}
              sx={{
                minHeight: metrics.height,
                px: density.px,
                py: density.py,
                fontSize: metrics.fontSize,
                color: theme.palette.text.secondary,
                '&.Mui-selected': {
                  color: intent.main,
                  backgroundColor: isPrimary
                    ? alpha(intent.container, 0.16)
                    : 'transparent',
                },
              }}
            />
          );
        })}
      </MuiTabs>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {items.map((item) => {
          const isActive = item.id === effectiveActiveId;
          const shouldMount = !lazy || isActive || mountedIds.has(item.id);
          if (!shouldMount) {
            return null;
          }

          const tabDomId = `${baseId}-tab-${item.id}`;
          const panelDomId = `${baseId}-panel-${item.id}`;
          const bodyContent = renderPanel ? (
            renderPanel(item, isActive)
          ) : item.content ? (
            <Typography variant="body2" color="text.secondary">
              {item.content}
            </Typography>
          ) : null;

          return (
            <Box
              key={item.id}
              id={panelDomId}
              role="tabpanel"
              aria-labelledby={tabDomId}
              hidden={!isActive}
              data-testid={testId ? `${testId}-panel-${item.id}` : undefined}
              sx={{
                p: 2,
                display: isActive ? 'block' : 'none',
              }}
            >
              {bodyContent}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
