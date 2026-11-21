import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MagicTextInput } from '../../atoms/text-input/text-input';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicFormField } from './form-field';

afterEach(cleanup);

describe('MagicFormField (React MUI)', () => {
  it('renders outlined field with label, hint, and associates label/helper with MagicTextInput', () => {
    const fieldRef = createRef<HTMLDivElement>();
    render(
      <MagicMuiThemeProvider>
        <MagicFormField
          ref={fieldRef}
          id="email-field"
          testId="email-field"
          label="Email address"
          hint="We never share your email."
        >
          <MagicTextInput testId="email-input" placeholder="you@example.com" />
        </MagicFormField>
      </MagicMuiThemeProvider>,
    );

    expect(fieldRef.current).toBeInstanceOf(HTMLDivElement);
    expect(screen.getByTestId('email-field').getAttribute('id')).toBe(
      'email-field',
    );

    const input = screen.getByLabelText('Email address');
    expect(input).toBe(screen.getByTestId('email-input'));

    const helper = screen.getByText('We never share your email.');
    expect(input.getAttribute('aria-describedby')).toBe(helper.id);
    expect(helper.getAttribute('role')).toBeNull();
  });

  it('renders filled appearance and propagates appearance to MagicTextInput', () => {
    const { container } = render(
      <MagicMuiThemeProvider>
        <MagicFormField
          appearance="filled"
          label="Filled Field"
          size="sm"
          fullWidth={false}
        >
          <MagicTextInput testId="filled-input" />
        </MagicFormField>
      </MagicMuiThemeProvider>,
    );

    expect(container.querySelector('.MuiFilledInput-root')).not.toBeNull();
    expect(screen.getByLabelText('Filled Field')).toBe(
      screen.getByTestId('filled-input'),
    );
  });

  it('displays errorText with alert role taking precedence over hint and marks control invalid', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicFormField
          label="Username"
          hint="Pick a unique username"
          errorText="Username already taken"
        >
          <MagicTextInput testId="username-input" />
        </MagicFormField>
      </MagicMuiThemeProvider>,
    );

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('Username already taken');
    expect(screen.queryByText('Pick a unique username')).toBeNull();

    const input = screen.getByTestId('username-input');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(alert.id);
  });

  it('supports prefix and suffix slots with both icon strings and custom ReactNodes', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicFormField
          label="Amount"
          prefix="payments"
          suffix={<span data-testid="currency-suffix">USD</span>}
        >
          <MagicTextInput testId="amount-input" />
        </MagicFormField>
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByText('payments')).toBeTruthy();
    expect(screen.getByTestId('currency-suffix').textContent).toBe('USD');
  });

  it('handles floatLabel="always" and auto shrinking on focus/fill', () => {
    const { container } = render(
      <MagicMuiThemeProvider>
        <MagicFormField label="Always Float" floatLabel="always">
          <MagicTextInput testId="always-input" />
        </MagicFormField>
        <MagicFormField label="Auto Float" floatLabel="auto">
          <MagicTextInput testId="auto-input" />
        </MagicFormField>
      </MagicMuiThemeProvider>,
    );

    const labels = container.querySelectorAll('label');
    expect(labels[0].className).toContain('MuiInputLabel-shrink');
    expect(labels[1].className).not.toContain('MuiInputLabel-shrink');

    const autoInput = screen.getByTestId('auto-input');
    fireEvent.focus(autoInput);
    expect(labels[1].className).toContain('MuiInputLabel-shrink');

    fireEvent.blur(autoInput);
    expect(labels[1].className).not.toContain('MuiInputLabel-shrink');

    fireEvent.change(autoInput, { target: { value: 'hello' } });
    expect(labels[1].className).toContain('MuiInputLabel-shrink');
  });

  it('handles subscriptSizing fixed vs dynamic when no hint or error is provided', () => {
    const { container: fixedContainer } = render(
      <MagicMuiThemeProvider>
        <MagicFormField label="Fixed" subscriptSizing="fixed">
          <MagicTextInput />
        </MagicFormField>
      </MagicMuiThemeProvider>,
    );
    expect(
      fixedContainer.querySelector('.MuiFormHelperText-root'),
    ).not.toBeNull();

    cleanup();

    const { container: dynamicContainer } = render(
      <MagicMuiThemeProvider>
        <MagicFormField label="Dynamic" subscriptSizing="dynamic">
          <MagicTextInput />
        </MagicFormField>
      </MagicMuiThemeProvider>,
    );
    expect(
      dynamicContainer.querySelector('.MuiFormHelperText-root'),
    ).toBeNull();
  });

  it('propagates required and disabled states and respects hideRequiredMarker', () => {
    const { container } = render(
      <MagicMuiThemeProvider>
        <MagicFormField label="Required Visible" required>
          <MagicTextInput testId="req-visible" />
        </MagicFormField>
        <MagicFormField
          label="Required Hidden Marker"
          required
          hideRequiredMarker
        >
          <MagicTextInput testId="req-hidden" />
        </MagicFormField>
        <MagicFormField label="Disabled Field" disabled>
          <MagicTextInput testId="disabled-field-input" />
        </MagicFormField>
      </MagicMuiThemeProvider>,
    );

    const asterisks = container.querySelectorAll('.MuiFormLabel-asterisk');
    expect(asterisks).toHaveLength(1);

    expect((screen.getByTestId('req-visible') as HTMLInputElement).required).toBe(
      true,
    );
    expect((screen.getByTestId('req-hidden') as HTMLInputElement).required).toBe(
      true,
    );
    expect(
      (screen.getByTestId('disabled-field-input') as HTMLInputElement).disabled,
    ).toBe(true);
  });

  it('syncs required and disabled flags upward from child MagicTextInput', () => {
    const { container } = render(
      <MagicMuiThemeProvider>
        <MagicFormField label="Child Required">
          <MagicTextInput required disabled testId="child-state-input" />
        </MagicFormField>
      </MagicMuiThemeProvider>,
    );

    expect(container.querySelector('.MuiFormLabel-asterisk')).not.toBeNull();
    expect(
      container.querySelector('.MuiInputLabel-root.Mui-disabled'),
    ).not.toBeNull();
  });

  it('renders cleanly without a label and supports ariaLabel on the FormControl', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicFormField
          testId="labelless-field"
          ariaLabel="Search query wrapper"
          subscriptSizing="dynamic"
        >
          <MagicTextInput ariaLabel="Search query" />
        </MagicFormField>
      </MagicMuiThemeProvider>,
    );

    expect(
      screen.getByTestId('labelless-field').getAttribute('aria-label'),
    ).toBe('Search query wrapper');
  });
});
