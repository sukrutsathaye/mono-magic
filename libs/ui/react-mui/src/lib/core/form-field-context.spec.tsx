import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  MagicFormFieldContext,
  useMagicFormFieldContext,
  type MagicFormFieldContextValue,
} from './form-field-context';

afterEach(cleanup);

function ContextConsumer() {
  const ctx = useMagicFormFieldContext();
  if (!ctx) {
    return <div data-testid="consumer">standalone</div>;
  }

  return (
    <div
      data-testid="consumer"
      data-control-id={ctx.controlId}
      data-label={ctx.label}
      data-appearance={ctx.appearance}
      data-size={ctx.size}
      data-float-label={ctx.floatLabel}
      data-has-error={String(ctx.hasError)}
      data-error-text={ctx.errorText ?? ''}
    >
      {ctx.prefix}
      {ctx.suffix}
    </div>
  );
}

describe('MagicFormFieldContext', () => {
  it('returns null when consumed outside of a provider', () => {
    render(<ContextConsumer />);
    expect(screen.getByTestId('consumer').textContent).toBe('standalone');
  });

  it('provides form field state via React 19 <MagicFormFieldContext value={...}>', () => {
    const setFocused = vi.fn();
    const setFilled = vi.fn();
    const contextValue: MagicFormFieldContextValue = {
      controlId: 'email-control',
      labelId: 'email-label',
      helperId: 'email-helper',
      label: 'Email address',
      appearance: 'outlined',
      size: 'md',
      floatLabel: 'auto',
      hideRequiredMarker: false,
      hasError: true,
      errorText: 'Invalid email',
      hint: 'Enter work email',
      required: true,
      disabled: false,
      prefix: <span data-testid="prefix">@</span>,
      suffix: <span data-testid="suffix">.com</span>,
      setFocused,
      setFilled,
    };

    render(
      <MagicFormFieldContext value={contextValue}>
        <ContextConsumer />
      </MagicFormFieldContext>,
    );

    const consumer = screen.getByTestId('consumer');
    expect(consumer.getAttribute('data-control-id')).toBe('email-control');
    expect(consumer.getAttribute('data-label')).toBe('Email address');
    expect(consumer.getAttribute('data-appearance')).toBe('outlined');
    expect(consumer.getAttribute('data-size')).toBe('md');
    expect(consumer.getAttribute('data-float-label')).toBe('auto');
    expect(consumer.getAttribute('data-has-error')).toBe('true');
    expect(consumer.getAttribute('data-error-text')).toBe('Invalid email');
    expect(screen.getByTestId('prefix').textContent).toBe('@');
    expect(screen.getByTestId('suffix').textContent).toBe('.com');
  });
});
