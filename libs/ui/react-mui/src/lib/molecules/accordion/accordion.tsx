import { useId, type ReactNode, type Ref } from 'react';
import MuiAccordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import type {
  AccordionItem,
  AccordionMoleculeProps,
  AtomicSize,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';

/**
 * Props for {@link MagicAccordion}, extending {@link AccordionMoleculeProps}
 * with controlled/uncontrolled expansion callbacks, custom item rendering,
 * and MUI styling props.
 */
export interface MagicAccordionProps extends AccordionMoleculeProps {
  /** Invoked whenever the list of expanded item IDs changes. */
  onExpandedChange?: (expandedIds: string[], toggledItem: AccordionItem) => void;
  /** Optional custom renderer for each expanded panel body, taking precedence over `item.content`. */
  renderItemContent?: (item: AccordionItem, isExpanded: boolean) => ReactNode;
  /** Optional MUI `sx` overrides applied to the outer `Stack` wrapper. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name applied to the outer `Stack` wrapper. */
  className?: string;
  /** React 19 ref forwarded directly to the outer `Stack` `<div>` element. */
  ref?: Ref<HTMLDivElement>;
}

const ACCORDION_SIZE_STYLES: Record<
  AtomicSize,
  { minHeight: number; px: number; py: number; titleSize: number; bodySize: number; iconSize: AtomicSize }
> = {
  xs: { minHeight: 36, px: 1.5, py: 0.75, titleSize: 13, bodySize: 12, iconSize: 'xs' },
  sm: { minHeight: 42, px: 1.75, py: 1, titleSize: 14, bodySize: 13, iconSize: 'sm' },
  md: { minHeight: 48, px: 2, py: 1.25, titleSize: 15, bodySize: 14, iconSize: 'md' },
  lg: { minHeight: 56, px: 2.5, py: 1.5, titleSize: 16, bodySize: 15, iconSize: 'lg' },
  xl: { minHeight: 64, px: 3, py: 1.75, titleSize: 18, bodySize: 16, iconSize: 'xl' },
};

function resolveInitialExpandedIds(
  items: readonly AccordionItem[],
  defaultExpandedIds?: readonly string[],
  multiple = false,
): readonly string[] {
  if (defaultExpandedIds !== undefined) {
    return multiple ? defaultExpandedIds : defaultExpandedIds.slice(0, 1);
  }
  const hinted = items.filter((item) => item.expanded).map((item) => item.id);
  return multiple ? hinted : hinted.slice(0, 1);
}

/**
 * Material 3 collapsible accordion molecule composing MUI v9 `Accordion`,
 * `AccordionSummary`, `AccordionDetails`, and {@link MagicIcon}.
 *
 * Supports single and `multiple` expansion modes, controlled (`expandedIds`) and
 * uncontrolled (`defaultExpandedIds` / `item.expanded`) state via
 * `useControllableState`, `outlined`/`raised` appearances, and all 5 atomic sizes.
 */
export function MagicAccordion({
  id,
  testId,
  ariaLabel,
  items,
  multiple = false,
  expandedIds,
  defaultExpandedIds,
  appearance = 'outlined',
  size = 'md',
  onExpandedChange,
  renderItemContent,
  sx,
  className,
  ref,
}: MagicAccordionProps) {
  const theme = useTheme();
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const sizeStyle = ACCORDION_SIZE_STYLES[size];
  const outlineColor = theme.palette.magic?.outline ?? theme.palette.divider;
  const surfaceColor =
    theme.palette.magic?.surface ?? theme.palette.background.paper;

  const [currentExpandedIds, setCurrentExpandedIds] = useControllableState<
    readonly string[]
  >({
    value: expandedIds,
    defaultValue: resolveInitialExpandedIds(items, defaultExpandedIds, multiple),
  });

  const handleToggle = (item: AccordionItem, nextExpanded: boolean) => {
    if (item.disabled) {
      return;
    }

    let nextIds: string[];
    if (multiple) {
      if (nextExpanded) {
        nextIds = currentExpandedIds.includes(item.id)
          ? [...currentExpandedIds]
          : [...currentExpandedIds, item.id];
      } else {
        nextIds = currentExpandedIds.filter((entry) => entry !== item.id);
      }
    } else {
      nextIds = nextExpanded ? [item.id] : [];
    }

    setCurrentExpandedIds(nextIds);
    onExpandedChange?.(nextIds, item);
  };

  return (
    <Stack
      ref={ref}
      id={id}
      spacing={1}
      data-testid={testId}
      data-appearance={appearance}
      data-size={size}
      aria-label={ariaLabel}
      className={className}
      sx={[{ width: '100%' }, ...extraSx]}
    >
      {items.map((item) => {
        const isExpanded = currentExpandedIds.includes(item.id);
        const headerId = `${baseId}-header-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;

        return (
          <MuiAccordion
            key={item.id}
            expanded={isExpanded}
            disabled={item.disabled ?? false}
            disableGutters
            variant={appearance === 'outlined' ? 'outlined' : 'elevation'}
            elevation={appearance === 'raised' ? 2 : 0}
            onChange={(_event, nextExpanded) => handleToggle(item, nextExpanded)}
            data-testid={testId ? `${testId}-item-${item.id}` : undefined}
            sx={{
              backgroundColor: surfaceColor,
              borderRadius: '12px !important',
              border:
                appearance === 'outlined'
                  ? `1px solid ${outlineColor}`
                  : '1px solid transparent',
              boxShadow:
                appearance === 'raised' ? theme.shadows[2] : 'none',
              overflow: 'hidden',
              '&::before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              id={headerId}
              aria-controls={panelId}
              expandIcon={<MagicIcon icon="expand_more" size={sizeStyle.iconSize} />}
              data-testid={testId ? `${testId}-summary-${item.id}` : undefined}
              sx={{
                minHeight: sizeStyle.minHeight,
                px: sizeStyle.px,
                '& .MuiAccordionSummary-content': {
                  my: sizeStyle.py,
                  alignItems: 'center',
                  gap: 1.25,
                },
              }}
            >
              {item.icon ? (
                <MagicIcon
                  icon={item.icon}
                  size={sizeStyle.iconSize}
                  color={isExpanded ? 'primary' : 'neutral'}
                />
              ) : null}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: sizeStyle.titleSize,
                    fontWeight: 600,
                    lineHeight: 1.35,
                  }}
                >
                  {item.title}
                </Typography>
                {item.summary ? (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.25 }}
                  >
                    {item.summary}
                  </Typography>
                ) : null}
              </Box>
            </AccordionSummary>

            <AccordionDetails
              id={panelId}
              aria-labelledby={headerId}
              role="region"
              data-testid={testId ? `${testId}-details-${item.id}` : undefined}
              sx={{
                px: sizeStyle.px,
                pt: 0,
                pb: sizeStyle.px,
                fontSize: sizeStyle.bodySize,
              }}
            >
              {renderItemContent ? (
                renderItemContent(item, isExpanded)
              ) : item.content ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: 'inherit' }}
                >
                  {item.content}
                </Typography>
              ) : null}
            </AccordionDetails>
          </MuiAccordion>
        );
      })}
    </Stack>
  );
}
