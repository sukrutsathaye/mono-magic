import type { FormEvent, Ref } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import type { SearchBarMoleculeProps } from '@mono-magic/atomic-design-interfaces';
import { MagicButton } from '../../atoms/button/button';
import { MagicTextInput } from '../../atoms/text-input/text-input';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import { MagicFormField } from '../form-field/form-field';

/**
 * Props for {@link MagicSearchBar}, extending {@link SearchBarMoleculeProps}
 * with controlled/uncontrolled query handling and React 19 / MUI v9 ergonomics.
 */
export interface MagicSearchBarProps extends SearchBarMoleculeProps {
  /** Initial query value when operating in uncontrolled mode. */
  defaultQuery?: string;
  /** Invoked whenever the query text changes. */
  onQueryChange?: (query: string) => void;
  /** Invoked with the current query when the search form is submitted. */
  onSearch?: (query: string) => void;
  /** Optional MUI `sx` overrides applied to the outer `<form>` container. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name applied to the outer `<form>` container. */
  className?: string;
  /** React 19 ref forwarded directly to the underlying `<form>` element. */
  ref?: Ref<HTMLFormElement>;
}

/**
 * Semantic search landmark (`role="search"`) composing {@link MagicFormField},
 * {@link MagicTextInput}, and {@link MagicButton}.
 *
 * Supports both controlled (`query` + `onQueryChange`) and uncontrolled
 * (`defaultQuery`) usage, submitting via either the action button or pressing Enter.
 */
export function MagicSearchBar({
  id,
  testId,
  ariaLabel,
  query,
  defaultQuery = '',
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
  sx,
  className,
  ref,
}: MagicSearchBarProps) {
  const [currentQuery, setCurrentQuery] = useControllableState<string>({
    value: query,
    defaultValue: defaultQuery,
    onChange: onQueryChange,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!disabled && !loading) {
      onSearch?.(currentQuery);
    }
  };

  return (
    <Box
      ref={ref}
      id={id}
      data-testid={testId}
      aria-label={ariaLabel ?? label}
      component="form"
      role="search"
      className={className}
      sx={sx}
      onSubmit={handleSubmit}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <MagicFormField
          label={label}
          appearance="outlined"
          size={size}
          subscriptSizing="dynamic"
          disabled={disabled}
          prefix={<MagicIcon icon="search" size={size} />}
          sx={{ flex: 1 }}
        >
          <MagicTextInput
            type="search"
            name="query"
            value={currentQuery}
            placeholder={placeholder}
            size={size}
            disabled={disabled}
            testId={testId ? `${testId}-input` : undefined}
            onChange={setCurrentQuery}
          />
        </MagicFormField>
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
