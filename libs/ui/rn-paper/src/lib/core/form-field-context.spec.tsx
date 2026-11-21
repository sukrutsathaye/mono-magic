import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Pressable, Text } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  MagicFormFieldProvider,
  useMagicFormFieldContext,
  type MagicFormFieldContextValue,
} from './form-field-context';

afterEach(cleanup);

function FieldConsumer() {
  const ctx = useMagicFormFieldContext();
  if (!ctx) {
    return <Text testID="ctx-status">standalone</Text>;
  }
  return (
    <>
      <Text testID="ctx-control-id">{ctx.controlId}</Text>
      <Text testID="ctx-label">{ctx.label ?? ''}</Text>
      <Text testID="ctx-appearance">{ctx.appearance}</Text>
      <Text testID="ctx-error">{String(ctx.hasError)}</Text>
      <Text testID="ctx-described-by">{ctx.describedBy ?? ''}</Text>
      <Pressable
        testID="ctx-focus-btn"
        onPress={() => {
          ctx.setFocused(true);
          ctx.setHasValue(true);
        }}
      >
        <Text>Focus</Text>
      </Pressable>
    </>
  );
}

describe('MagicFormFieldContext', () => {
  it('returns null when consumed outside a MagicFormFieldProvider', () => {
    render(<FieldConsumer />);
    expect(screen.getByTestId('ctx-status').textContent).toBe('standalone');
  });

  it('exposes field metadata and state callbacks to nested controls', () => {
    const setFocused = vi.fn();
    const setHasValue = vi.fn();

    const value: MagicFormFieldContextValue = {
      controlId: 'field-1-control',
      labelId: 'field-1-label',
      hintId: 'field-1-hint',
      errorId: 'field-1-error',
      describedBy: 'field-1-error',
      label: 'Email',
      hint: 'Work address',
      errorText: 'Required',
      hasError: true,
      appearance: 'filled',
      size: 'md',
      floatLabel: 'auto',
      subscriptSizing: 'fixed',
      hideRequiredMarker: false,
      disabled: false,
      required: true,
      focused: false,
      hasValue: false,
      setFocused,
      setHasValue,
    };

    render(
      <MagicFormFieldProvider value={value}>
        <FieldConsumer />
      </MagicFormFieldProvider>
    );

    expect(screen.getByTestId('ctx-control-id').textContent).toBe(
      'field-1-control'
    );
    expect(screen.getByTestId('ctx-label').textContent).toBe('Email');
    expect(screen.getByTestId('ctx-appearance').textContent).toBe('filled');
    expect(screen.getByTestId('ctx-error').textContent).toBe('true');
    expect(screen.getByTestId('ctx-described-by').textContent).toBe(
      'field-1-error'
    );

    fireEvent.click(screen.getByTestId('ctx-focus-btn'));
    expect(setFocused).toHaveBeenCalledWith(true);
    expect(setHasValue).toHaveBeenCalledWith(true);
  });
});
