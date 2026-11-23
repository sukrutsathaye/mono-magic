import { useId, type ChangeEvent, type Ref } from 'react';
import MenuItem from '@mui/material/MenuItem';
import MuiPagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme, type SxProps, type Theme } from '@mui/material/styles';
import type {
  AtomicSize,
  PaginationMoleculeProps,
} from '@mono-magic/atomic-design-interfaces';
import { useControllableState } from '../../core/use-controllable-state';
import { resolveMagicIntentColors } from '../../theme/mui-theme';

/**
 * Props for {@link MagicPagination}, extending {@link PaginationMoleculeProps}
 * with React 19 / MUI v9 page and page-size change callbacks and styling props.
 */
export interface MagicPaginationProps extends PaginationMoleculeProps {
  /** Invoked whenever the active 1-indexed page number changes. */
  onPageChange?: (page: number) => void;
  /** Invoked whenever the user selects a different `pageSize`. */
  onPageSizeChange?: (pageSize: number) => void;
  /** Optional MUI `sx` overrides applied to the outer wrapper `Stack`. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name applied to the outer wrapper `Stack`. */
  className?: string;
  /** React 19 ref forwarded directly to the outer wrapper `<div>` element. */
  ref?: Ref<HTMLDivElement>;
}

const PAGINATION_SIZE_MAP: Record<AtomicSize, 'small' | 'medium' | 'large'> = {
  xs: 'small',
  sm: 'small',
  md: 'medium',
  lg: 'large',
  xl: 'large',
};

const PAGINATION_ITEM_DIMENSIONS: Record<
  AtomicSize,
  { minWidth: number; height: number; fontSize: number }
> = {
  xs: { minWidth: 26, height: 26, fontSize: 12 },
  sm: { minWidth: 30, height: 30, fontSize: 13 },
  md: { minWidth: 34, height: 34, fontSize: 14 },
  lg: { minWidth: 40, height: 40, fontSize: 15 },
  xl: { minWidth: 46, height: 46, fontSize: 16 },
};

const DEFAULT_PAGE_SIZE_OPTIONS: readonly number[] = [10, 25, 50, 100];

/**
 * Material 3 pagination molecule composing MUI v9 `Pagination`, `PaginationItem`,
 * and `Select` for page-size switching.
 *
 * Supports controlled (`page`) and uncontrolled (`defaultPage`) navigation,
 * live `pageSize` switching, total range summary (`1-10 of 95`), `first`/`last`
 * jump controls, `text`/`outlined`/`filled` variants, `rounded`/`circular` shapes,
 * and all 7 semantic `ColorIntent` palettes.
 */
export function MagicPagination({
  id,
  testId,
  ariaLabel,
  page,
  defaultPage = 1,
  totalItems,
  pageSize = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  siblingCount = 1,
  boundaryCount = 1,
  showFirstLast = false,
  showPageSizeSelector = false,
  showTotalCount = false,
  variant = 'text',
  shape = 'rounded',
  color = 'primary',
  size = 'md',
  disabled = false,
  onPageChange,
  onPageSizeChange,
  sx,
  className,
  ref,
}: MagicPaginationProps) {
  const theme = useTheme();
  const generatedId = useId();
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const intent = resolveMagicIntentColors(theme, color);
  const itemDim = PAGINATION_ITEM_DIMENSIONS[size];
  const outlineColor = theme.palette.magic?.outline ?? theme.palette.divider;

  const [currentPageSize, setCurrentPageSize] = useControllableState<number>({
    value: undefined,
    defaultValue: Math.max(1, pageSize),
  });

  const effectivePageSize =
    onPageSizeChange && pageSize !== undefined
      ? Math.max(1, pageSize)
      : Math.max(1, currentPageSize);

  const safeTotalItems = Math.max(0, totalItems);
  const pageCount = Math.max(1, Math.ceil(safeTotalItems / effectivePageSize));

  const [currentPage, setCurrentPage] = useControllableState<number>({
    value: page,
    defaultValue: Math.min(Math.max(1, defaultPage), pageCount),
    onChange: onPageChange,
  });

  const clampedPage = Math.min(Math.max(1, currentPage), pageCount);

  const startItem =
    safeTotalItems === 0 ? 0 : (clampedPage - 1) * effectivePageSize + 1;
  const endItem =
    safeTotalItems === 0
      ? 0
      : Math.min(clampedPage * effectivePageSize, safeTotalItems);

  const handlePageChange = (_event: ChangeEvent<unknown>, nextPage: number) => {
    if (disabled) {
      return;
    }
    setCurrentPage(nextPage);
  };

  const handlePageSizeSelect = (event: SelectChangeEvent<number>) => {
    if (disabled) {
      return;
    }
    const nextSize = Math.max(1, Number(event.target.value));
    setCurrentPageSize(nextSize);
    onPageSizeChange?.(nextSize);
    const nextMaxPages = Math.max(1, Math.ceil(safeTotalItems / nextSize));
    if (clampedPage > nextMaxPages) {
      setCurrentPage(nextMaxPages);
    }
  };

  const resolvedSizeOptions = pageSizeOptions.includes(effectivePageSize)
    ? pageSizeOptions
    : [...pageSizeOptions, effectivePageSize].sort((a, b) => a - b);

  const muiVariant = variant === 'outlined' ? 'outlined' : 'text';
  const selectLabelId = `${id ?? generatedId}-pagesize-label`;

  return (
    <Stack
      ref={ref}
      id={id}
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      data-testid={testId}
      data-variant={variant}
      data-shape={shape}
      data-size={size}
      aria-label={ariaLabel ?? 'Pagination navigation'}
      className={className}
      sx={[
        { width: '100%', alignItems: 'center', justifyContent: 'space-between' },
        ...extraSx,
      ]}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
      >
        {showTotalCount ? (
          <Typography
            variant="body2"
            color="text.secondary"
            data-testid={testId ? `${testId}-total` : undefined}
            sx={{ fontSize: itemDim.fontSize - 1, whiteSpace: 'nowrap' }}
          >
            {safeTotalItems === 0
              ? '0 of 0'
              : `${startItem}-${endItem} of ${safeTotalItems}`}
          </Typography>
        ) : null}

        {showPageSizeSelector ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography
              id={selectLabelId}
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: itemDim.fontSize - 1, whiteSpace: 'nowrap' }}
            >
              Rows per page
            </Typography>
            <Select<number>
              size="small"
              aria-labelledby={selectLabelId}
              value={effectivePageSize}
              disabled={disabled}
              onChange={handlePageSizeSelect}
              inputProps={{
                'aria-label': 'Rows per page',
                ...(testId ? { 'data-testid': `${testId}-page-size-input` } : {}),
              }}
              data-testid={testId ? `${testId}-page-size` : undefined}
              sx={{
                minWidth: 72,
                height: Math.max(28, itemDim.height),
                fontSize: itemDim.fontSize - 1,
              }}
            >
              {resolvedSizeOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        ) : null}
      </Stack>

      <MuiPagination
        count={pageCount}
        page={clampedPage}
        siblingCount={siblingCount}
        boundaryCount={boundaryCount}
        showFirstButton={showFirstLast}
        showLastButton={showFirstLast}
        variant={muiVariant}
        shape={shape}
        size={PAGINATION_SIZE_MAP[size]}
        disabled={disabled}
        onChange={handlePageChange}
        renderItem={(item) => (
          <PaginationItem
            {...item}
            data-testid={
              testId
                ? `${testId}-item-${item.type}${item.type === 'page' ? `-${item.page}` : ''}`
                : undefined
            }
            sx={{
              minWidth: itemDim.minWidth,
              height: itemDim.height,
              fontSize: itemDim.fontSize,
              ...(variant === 'filled' && !item.selected
                ? {
                    backgroundColor: alpha(
                      theme.palette.magic?.surfaceContainerHighest ??
                        theme.palette.action.hover,
                      0.7,
                    ),
                  }
                : {}),
              ...(variant === 'outlined' && !item.selected
                ? {
                    borderColor: outlineColor,
                  }
                : {}),
              '&.Mui-selected': {
                backgroundColor:
                  variant === 'text' ? alpha(intent.container, 0.85) : intent.main,
                color:
                  variant === 'text' ? intent.onContainer : intent.contrastText,
                borderColor: intent.main,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor:
                    variant === 'text'
                      ? intent.container
                      : alpha(intent.main, 0.88),
                },
              },
            }}
          />
        )}
      />
    </Stack>
  );
}
