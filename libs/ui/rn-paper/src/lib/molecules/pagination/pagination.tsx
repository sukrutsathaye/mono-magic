import { useCallback, useId, useMemo, useState, type Ref } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {
  AtomicSize,
  PaginationMoleculeProps,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import { useMagicPaperColors } from '../../theme/paper-theme';

export type {
  MagicPaginationProps as PaginationBaseProps,
  PaginationMoleculeProps,
  PaginationShape,
  PaginationVariant,
} from '@mono-magic/atomic-design-interfaces';

/** Props for the React Native Paper `MagicPagination` molecule. */
export interface MagicPaginationProps extends PaginationMoleculeProps {
  /** Fired when the active 1-indexed page changes. */
  onPageChange?: (page: number) => void;
  /** Fired when the selected page size changes. */
  onPageSizeChange?: (pageSize: number) => void;
  /** Style override applied to the outer pagination container. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the outer container `View`. */
  ref?: Ref<View>;
}

interface PaginationSizeTokens {
  buttonSize: number;
  fontSize: number;
  iconSize: number;
  gap: number;
  metaFontSize: number;
}

const PAGINATION_SIZE_TOKENS: Record<AtomicSize, PaginationSizeTokens> = {
  xs: { buttonSize: 26, fontSize: 11, iconSize: 15, gap: 4, metaFontSize: 11 },
  sm: { buttonSize: 30, fontSize: 12, iconSize: 17, gap: 5, metaFontSize: 12 },
  md: { buttonSize: 36, fontSize: 13, iconSize: 19, gap: 6, metaFontSize: 13 },
  lg: { buttonSize: 42, fontSize: 15, iconSize: 21, gap: 8, metaFontSize: 14 },
  xl: { buttonSize: 48, fontSize: 16, iconSize: 23, gap: 10, metaFontSize: 15 },
};

const DEFAULT_PAGE_SIZE_OPTIONS: readonly number[] = [10, 25, 50, 100];

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  controlsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
  },
  pageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  pageLabel: {
    fontWeight: '600',
    textAlign: 'center',
  },
  ellipsis: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  totalText: {
    fontWeight: '500',
  },
  pageSizeWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 30,
  },
  pageSizeTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  pageSizeMenu: {
    position: 'absolute',
    right: 0,
    minWidth: 80,
    borderWidth: 1,
    paddingVertical: 4,
    zIndex: 50,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.16)',
      },
      default: {
        elevation: 4,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  pageSizeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});

export type PaginationToken = number | 'start-ellipsis' | 'end-ellipsis';

function buildPaginationTokens(
  totalPages: number,
  currentPage: number,
  siblingCount: number,
  boundaryCount: number
): readonly PaginationToken[] {
  if (totalPages <= 0) {
    return [];
  }

  const range = (start: number, end: number): number[] => {
    const result: number[] = [];
    for (let i = start; i <= end; i += 1) {
      result.push(i);
    }
    return result;
  };

  const startPages = range(1, Math.min(boundaryCount, totalPages));
  const endPages = range(
    Math.max(totalPages - boundaryCount + 1, boundaryCount + 1),
    totalPages
  );

  const siblingsStart = Math.max(
    Math.min(
      currentPage - siblingCount,
      totalPages - boundaryCount - siblingCount * 2 - 1
    ),
    boundaryCount + 2
  );

  const siblingsEnd = Math.min(
    Math.max(currentPage + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : totalPages - 1
  );

  const tokens: PaginationToken[] = [...startPages];

  if (siblingsStart > boundaryCount + 2) {
    tokens.push('start-ellipsis');
  } else if (boundaryCount + 1 < totalPages - boundaryCount) {
    tokens.push(boundaryCount + 1);
  }

  tokens.push(...range(siblingsStart, siblingsEnd));

  if (siblingsEnd < totalPages - boundaryCount - 1) {
    tokens.push('end-ellipsis');
  } else if (totalPages - boundaryCount > boundaryCount) {
    const bridge = totalPages - boundaryCount;
    if (!tokens.includes(bridge)) {
      tokens.push(bridge);
    }
  }

  for (const endPage of endPages) {
    if (!tokens.includes(endPage)) {
      tokens.push(endPage);
    }
  }

  return tokens;
}

/**
 * Material 3 pagination molecule for `@mono-magic/rn-paper`.
 *
 * Supports controlled/uncontrolled 1-indexed `page`, `totalItems` + `pageSize`,
 * `siblingCount` & `boundaryCount` ellipsis collapsing, `showFirstLast`,
 * `showTotalCount`, interactive `showPageSizeSelector`, and `'text' | 'outlined' | 'filled'`
 * variants in `'rounded' | 'circular'` shapes.
 */
export function MagicPagination({
  id,
  testId,
  ariaLabel,
  page: controlledPage,
  defaultPage = 1,
  totalItems,
  pageSize: controlledPageSize,
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
  style,
  ref,
}: MagicPaginationProps) {
  const { theme, colors, resolveIntent } = useMagicPaperColors();
  const intent = resolveIntent(color);
  const tokens = PAGINATION_SIZE_TOKENS[size];
  const generatedId = useId();
  const baseId = id ?? generatedId;

  const [internalPageSize, setInternalPageSize] = useState<number>(
    controlledPageSize ?? pageSizeOptions[0] ?? 10
  );
  const effectivePageSize = controlledPageSize ?? internalPageSize;
  const safePageSize = Math.max(1, effectivePageSize);
  const totalPages = Math.max(1, Math.ceil(Math.max(0, totalItems) / safePageSize));

  const [rawPage, setPage] = useControllableState<number>({
    value: controlledPage,
    defaultValue: defaultPage,
    onChange: onPageChange,
  });

  const currentPage = Math.max(1, Math.min(rawPage, totalPages));
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);

  const pageTokens = useMemo(
    () => buildPaginationTokens(totalPages, currentPage, siblingCount, boundaryCount),
    [boundaryCount, currentPage, siblingCount, totalPages]
  );

  const goToPage = useCallback(
    (nextPage: number) => {
      if (disabled) {
        return;
      }
      const clamped = Math.max(1, Math.min(nextPage, totalPages));
      if (clamped !== currentPage) {
        setPage(clamped);
      }
    },
    [currentPage, disabled, setPage, totalPages]
  );

  const handleSelectPageSize = useCallback(
    (nextSize: number) => {
      if (disabled) {
        return;
      }
      setSizeMenuOpen(false);
      if (controlledPageSize === undefined) {
        setInternalPageSize(nextSize);
      }
      onPageSizeChange?.(nextSize);
      const nextTotalPages = Math.max(
        1,
        Math.ceil(Math.max(0, totalItems) / Math.max(1, nextSize))
      );
      if (currentPage > nextTotalPages) {
        setPage(nextTotalPages);
      } else if (currentPage !== 1) {
        setPage(1);
      }
    },
    [
      controlledPageSize,
      currentPage,
      disabled,
      onPageSizeChange,
      setPage,
      totalItems,
    ]
  );

  const radius =
    shape === 'circular' ? tokens.buttonSize / 2 : Math.min(8, theme.roundness);
  const dividerColor = colors.outlineVariant ?? colors.outline;

  const startItem =
    totalItems <= 0 ? 0 : (currentPage - 1) * safePageSize + 1;
  const endItem =
    totalItems <= 0 ? 0 : Math.min(currentPage * safePageSize, totalItems);

  const renderNavButton = (
    key: string,
    buttonTestId: string | undefined,
    iconName: string,
    label: string,
    targetPage: number,
    isDisabled: boolean
  ) => {
    const isOutlined = variant === 'outlined';
    const isFilled = variant === 'filled';
    return (
      <Pressable
        key={key}
        testID={buttonTestId}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled }}
        onPress={() => goToPage(targetPage)}
        style={({ pressed }) => [
          styles.pageButton,
          {
            minWidth: tokens.buttonSize,
            height: tokens.buttonSize,
            borderRadius: radius,
            borderWidth: isOutlined ? 1 : 0,
            borderColor: isOutlined ? dividerColor : 'transparent',
            backgroundColor: isDisabled
              ? isFilled
                ? colors.surfaceDisabled
                : 'transparent'
              : pressed
                ? colors.surfaceVariant
                : isFilled
                  ? colors.surfaceVariant
                  : 'transparent',
          },
        ]}
      >
        <MagicIcon
          icon={iconName}
          size={tokens.iconSize}
          color={isDisabled ? colors.onSurfaceDisabled : colors.onSurface}
        />
      </Pressable>
    );
  };

  const webNavProps =
    Platform.OS === 'web'
      ? ({ role: 'navigation' } as Record<string, unknown>)
      : {};

  return (
    <View
      ref={ref}
      nativeID={baseId}
      testID={testId}
      accessibilityLabel={ariaLabel ?? 'Pagination'}
      style={[styles.root, style]}
      {...webNavProps}
    >
      <View style={[styles.controlsRow, { gap: tokens.gap }]}>
        {showFirstLast
          ? renderNavButton(
              'first',
              testId ? `${testId}-first` : undefined,
              'first_page',
              'First page',
              1,
              disabled || currentPage <= 1
            )
          : null}

        {renderNavButton(
          'prev',
          testId ? `${testId}-prev` : undefined,
          'chevron_left',
          'Previous page',
          currentPage - 1,
          disabled || currentPage <= 1
        )}

        {pageTokens.map((token) => {
          if (token === 'start-ellipsis' || token === 'end-ellipsis') {
            return (
              <View
                key={token}
                testID={testId ? `${testId}-${token}` : undefined}
                style={[styles.ellipsis, { height: tokens.buttonSize }]}
              >
                <Text
                  style={{
                    color: disabled
                      ? colors.onSurfaceDisabled
                      : colors.onSurfaceVariant,
                    fontSize: tokens.fontSize,
                  }}
                >
                  …
                </Text>
              </View>
            );
          }

          const isCurrent = token === currentPage;
          const isOutlined = variant === 'outlined';
          const isFilled = variant === 'filled';

          const bg = disabled
            ? isCurrent || isFilled
              ? colors.surfaceDisabled
              : 'transparent'
            : isCurrent
              ? intent.main
              : isFilled
                ? colors.surfaceVariant
                : 'transparent';

          const fg = disabled
            ? colors.onSurfaceDisabled
            : isCurrent
              ? intent.onMain
              : colors.onSurface;

          const borderColor = disabled
            ? colors.surfaceDisabled
            : isCurrent
              ? intent.main
              : isOutlined
                ? dividerColor
                : 'transparent';

          const webAriaCurrent =
            Platform.OS === 'web' && isCurrent
              ? ({ 'aria-current': 'page' } as Record<string, unknown>)
              : {};

          return (
            <Pressable
              key={`page-${token}`}
              testID={testId ? `${testId}-page-${token}` : undefined}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={`Page ${token}`}
              accessibilityState={{ selected: isCurrent, disabled }}
              onPress={() => goToPage(token)}
              style={({ pressed }) => [
                styles.pageButton,
                {
                  minWidth: tokens.buttonSize,
                  height: tokens.buttonSize,
                  borderRadius: radius,
                  borderWidth: isOutlined || isCurrent ? 1 : 0,
                  borderColor,
                  backgroundColor:
                    pressed && !disabled && !isCurrent
                      ? colors.surfaceVariant
                      : bg,
                },
              ]}
              {...webAriaCurrent}
            >
              <Text
                style={[
                  styles.pageLabel,
                  { color: fg, fontSize: tokens.fontSize },
                ]}
              >
                {token}
              </Text>
            </Pressable>
          );
        })}

        {renderNavButton(
          'next',
          testId ? `${testId}-next` : undefined,
          'chevron_right',
          'Next page',
          currentPage + 1,
          disabled || currentPage >= totalPages
        )}

        {showFirstLast
          ? renderNavButton(
              'last',
              testId ? `${testId}-last` : undefined,
              'last_page',
              'Last page',
              totalPages,
              disabled || currentPage >= totalPages
            )
          : null}
      </View>

      {showTotalCount || showPageSizeSelector ? (
        <View style={styles.metaRow}>
          {showTotalCount ? (
            <Text
              testID={testId ? `${testId}-total` : undefined}
              style={[
                styles.totalText,
                {
                  color: disabled
                    ? colors.onSurfaceDisabled
                    : colors.onSurfaceVariant,
                  fontSize: tokens.metaFontSize,
                },
              ]}
            >
              {`${startItem}-${endItem} of ${totalItems}`}
            </Text>
          ) : null}

          {showPageSizeSelector ? (
            <View style={styles.pageSizeWrapper}>
              <Text
                style={{
                  color: disabled
                    ? colors.onSurfaceDisabled
                    : colors.onSurfaceVariant,
                  fontSize: tokens.metaFontSize,
                }}
              >
                Rows:
              </Text>
              <Pressable
                testID={testId ? `${testId}-page-size-trigger` : undefined}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel="Rows per page"
                accessibilityState={{ expanded: sizeMenuOpen, disabled }}
                onPress={() => setSizeMenuOpen((prev) => !prev)}
                style={[
                  styles.pageSizeTrigger,
                  {
                    height: tokens.buttonSize,
                    borderRadius: Math.min(8, theme.roundness),
                    borderColor: dividerColor,
                    backgroundColor: disabled
                      ? colors.surfaceDisabled
                      : colors.surface,
                  },
                ]}
              >
                <Text
                  testID={testId ? `${testId}-page-size-value` : undefined}
                  style={{
                    color: disabled
                      ? colors.onSurfaceDisabled
                      : colors.onSurface,
                    fontSize: tokens.metaFontSize,
                    fontWeight: '600',
                  }}
                >
                  {safePageSize}
                </Text>
                <MagicIcon
                  icon={sizeMenuOpen ? 'expand_less' : 'expand_more'}
                  size={tokens.iconSize - 2}
                  color={
                    disabled ? colors.onSurfaceDisabled : colors.onSurfaceVariant
                  }
                />
              </Pressable>

              {sizeMenuOpen && !disabled ? (
                <View
                  testID={testId ? `${testId}-page-size-menu` : undefined}
                  style={[
                    styles.pageSizeMenu,
                    {
                      top: tokens.buttonSize + 4,
                      borderRadius: theme.roundness,
                      borderColor: dividerColor,
                      backgroundColor: colors.elevation.level2,
                    },
                  ]}
                >
                  {pageSizeOptions.map((option) => {
                    const isActiveSize = option === safePageSize;
                    return (
                      <Pressable
                        key={`size-${option}`}
                        testID={
                          testId
                            ? `${testId}-page-size-option-${option}`
                            : undefined
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`${option} per page`}
                        accessibilityState={{ selected: isActiveSize }}
                        onPress={() => handleSelectPageSize(option)}
                        style={({ pressed }) => [
                          styles.pageSizeOption,
                          {
                            backgroundColor: isActiveSize
                              ? intent.container
                              : pressed
                                ? colors.surfaceVariant
                                : 'transparent',
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: isActiveSize
                              ? intent.onContainer
                              : colors.onSurface,
                            fontSize: tokens.metaFontSize,
                            fontWeight: isActiveSize ? '700' : '400',
                          }}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
