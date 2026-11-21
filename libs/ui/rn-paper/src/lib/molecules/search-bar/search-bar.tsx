import { useCallback, type Ref } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { SearchBarMoleculeProps } from '@mono-magic/atomic-design-interfaces';
import { MagicButton } from '../../atoms/button/button';
import { MagicTextInput } from '../../atoms/text-input/text-input';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import {
  MAGIC_PAPER_SIZE_METRICS,
  useMagicPaperColors,
} from '../../theme/paper-theme';
import { MagicFormField } from '../form-field/form-field';

export interface MagicSearchBarProps extends SearchBarMoleculeProps {
  /** Initial query used in uncontrolled mode (`query` is omitted). */
  defaultQuery?: string;
  /** Emitted whenever the search input text changes. */
  onQueryChange?: (query: string) => void;
  /** Emitted with the current query when submitted via Enter or the submit button. */
  onSearch?: (query: string) => void;
  /** Style override applied to the outer search container. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the outer search container `View`. */
  ref?: Ref<View>;
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  fieldWrapper: {
    flex: 1,
    minWidth: 0,
  },
});

/**
 * Search landmark molecule composing `MagicFormField`, `MagicTextInput`,
 * `MagicIcon`, and `MagicButton`.
 */
export function MagicSearchBar({
  id,
  testId,
  ariaLabel,
  query,
  defaultQuery,
  placeholder = 'Search...',
  label = 'Search',
  submitLabel = 'Search',
  buttonVariant = 'filled',
  buttonColor = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onQueryChange,
  onSearch,
  style,
  ref,
}: MagicSearchBarProps) {
  const { colors } = useMagicPaperColors();
  const metrics = MAGIC_PAPER_SIZE_METRICS[size];

  const [currentQuery, setCurrentQuery] = useControllableState<string>({
    value: query,
    defaultValue: defaultQuery ?? '',
    onChange: onQueryChange,
  });

  const handleSearch = useCallback(
    (submittedQuery?: string) => {
      if (!disabled && !loading) {
        onSearch?.(submittedQuery ?? currentQuery);
      }
    },
    [currentQuery, disabled, loading, onSearch]
  );

  return (
    <View
      ref={ref}
      nativeID={id}
      testID={testId}
      accessibilityRole="search"
      accessibilityLabel={ariaLabel ?? label}
      style={[styles.root, style]}
    >
      <View style={styles.fieldWrapper}>
        <MagicFormField
          label={label}
          size={size}
          subscriptSizing="dynamic"
          disabled={disabled}
          testId={testId ? `${testId}-field` : undefined}
          prefix={
            <MagicIcon
              icon="search"
              size={metrics.iconSize}
              color={
                disabled ? colors.onSurfaceDisabled : colors.onSurfaceVariant
              }
            />
          }
        >
          <MagicTextInput
            type="search"
            placeholder={placeholder}
            value={currentQuery}
            size={size}
            disabled={disabled}
            testId={testId ? `${testId}-input` : undefined}
            onChange={setCurrentQuery}
            onSubmit={handleSearch}
          />
        </MagicFormField>
      </View>
      <MagicButton
        label={submitLabel}
        variant={buttonVariant}
        color={buttonColor}
        size={size}
        disabled={disabled}
        loading={loading}
        testId={testId ? `${testId}-submit` : undefined}
        onPress={() => handleSearch()}
      />
    </View>
  );
}
