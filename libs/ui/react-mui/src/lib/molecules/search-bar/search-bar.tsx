import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { SearchBarMoleculeProps } from '@mono-magic/interfaces';
import { MagicButton } from '../../atoms/button/button';
import { MagicTextInput } from '../../atoms/text-input/text-input';

export interface MagicSearchBarProps extends SearchBarMoleculeProps {
  onQueryChange?: (query: string) => void;
  onSearch?: (query: string) => void;
}

export function MagicSearchBar({
  id,
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
    <Box
      id={id}
      data-testid={testId}
      aria-label={ariaLabel ?? label}
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <MagicTextInput
          label={label}
          value={currentQuery}
          placeholder={placeholder}
          size={size}
          disabled={disabled}
          testId={testId ? `${testId}-input` : undefined}
          onChange={handleChange}
        />
        <MagicButton
          type="submit"
          label={submitLabel}
          variant={buttonVariant}
          color={buttonColor}
          size={size}
          disabled={disabled}
          loading={loading}
          testId={testId ? `${testId}-submit` : undefined}
        />
      </Stack>
    </Box>
  );
}
