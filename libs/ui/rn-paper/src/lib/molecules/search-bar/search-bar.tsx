import { useState } from 'react';
import { View } from 'react-native';
import type { SearchBarMoleculeProps } from '@mono-magic/interfaces';
import { MagicButton } from '../../atoms/button/button';
import { MagicTextInput } from '../../atoms/text-input/text-input';

export interface MagicSearchBarProps extends SearchBarMoleculeProps {
  onQueryChange?: (query: string) => void;
  onSearch?: (query: string) => void;
}

export function MagicSearchBar({
  testId,
  ariaLabel,
  query,
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
}: MagicSearchBarProps) {
  const [internalQuery, setInternalQuery] = useState(query ?? '');
  const currentQuery = query ?? internalQuery;

  const handleChange = (next: string) => {
    if (query === undefined) {
      setInternalQuery(next);
    }
    onQueryChange?.(next);
  };

  const handleSubmit = () => {
    if (!disabled && !loading) {
      onSearch?.(currentQuery);
    }
  };

  return (
    <View
      testID={testId}
      accessibilityLabel={ariaLabel ?? label}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
    >
      <View style={{ flex: 1 }}>
        <MagicTextInput
          label={label}
          value={currentQuery}
          placeholder={placeholder}
          size={size}
          disabled={disabled}
          testId={testId ? `${testId}-input` : undefined}
          onChangeText={handleChange}
          onSubmitEditing={handleSubmit}
        />
      </View>
      <MagicButton
        label={submitLabel}
        variant={buttonVariant}
        color={buttonColor}
        size={size}
        disabled={disabled}
        loading={loading}
        testId={testId ? `${testId}-submit` : undefined}
        onPress={handleSubmit}
      />
    </View>
  );
}
