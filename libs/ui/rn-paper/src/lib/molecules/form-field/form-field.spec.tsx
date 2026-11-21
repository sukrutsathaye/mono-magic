import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Text, type View } from 'react-native';
import { afterEach, describe, expect, it } from 'vitest';
import { MagicTextInput } from '../../atoms/text-input/text-input';
import { MagicIcon } from '../../core/icon';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicFormField } from './form-field';

afterEach(cleanup);

describe('MagicFormField', () => {
  it('renders outlined appearance with label, hint, and nested MagicTextInput', () => {
    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicFormField
          id="email-field"
          testId="email-ff"
          label="Email address"
          hint="We never share your email"
        >
          <MagicTextInput testId="email-input" placeholder="you@example.com" />
        </MagicFormField>
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('email-ff-label').textContent).toBe(
      'Email address'
    );
    expect(screen.getByTestId('email-ff-hint').textContent).toBe(
      'We never share your email'
    );

    const input = screen.getByTestId('email-input');
    expect(input.getAttribute('id')).toBe('email-field-control');
    expect(input.getAttribute('aria-describedby')).toBe('email-field-hint');
    expect(input.getAttribute('aria-labelledby')).toBe('email-field-label');
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('renders filled appearance and updates border color on focus and blur', () => {
    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicFormField
          testId="filled-ff"
          appearance="filled"
          label="Display name"
        >
          <MagicTextInput testId="filled-input" />
        </MagicFormField>
      </MagicPaperProvider>
    );

    const container = screen.getByTestId('filled-ff-container');
    const input = screen.getByTestId('filled-input');

    // Resting state before focus
    expect(container.style.borderBottomWidth).toBe('1px');

    fireEvent.focus(input);
    expect(container.style.borderBottomWidth).toBe('2px');

    fireEvent.blur(input);
    expect(container.style.borderBottomWidth).toBe('1px');
  });

  it('prefers errorText over hint and marks nested control aria-invalid', () => {
    render(
      <MagicPaperProvider>
        <MagicFormField
          id="user-field"
          testId="user-ff"
          label="Username"
          hint="Pick a unique handle"
          errorText="Username is already taken"
        >
          <MagicTextInput testId="user-input" />
        </MagicFormField>
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('user-ff-error').textContent).toBe(
      'Username is already taken'
    );
    expect(screen.queryByTestId('user-ff-hint')).toBeNull();

    const input = screen.getByTestId('user-input');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('user-field-error');
  });

  it('appends required marker unless hideRequiredMarker is true', () => {
    const { rerender } = render(
      <MagicPaperProvider>
        <MagicFormField testId="req-ff" label="Full name" required>
          <MagicTextInput testId="req-input" />
        </MagicFormField>
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('req-ff-label').textContent).toBe('Full name *');
    expect(screen.getByTestId('req-input').getAttribute('aria-required')).toBe(
      'true'
    );

    rerender(
      <MagicPaperProvider>
        <MagicFormField
          testId="req-ff"
          label="Full name"
          required
          hideRequiredMarker
        >
          <MagicTextInput testId="req-input" />
        </MagicFormField>
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('req-ff-label').textContent).toBe('Full name');
  });

  it('supports subscriptSizing fixed vs dynamic when no hint or error is present', () => {
    const { rerender } = render(
      <MagicPaperProvider>
        <MagicFormField testId="sub-ff" label="Notes" subscriptSizing="fixed">
          <MagicTextInput />
        </MagicFormField>
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('sub-ff-subscript-spacer')).toBeTruthy();

    rerender(
      <MagicPaperProvider>
        <MagicFormField testId="sub-ff" label="Notes" subscriptSizing="dynamic">
          <MagicTextInput />
        </MagicFormField>
      </MagicPaperProvider>
    );

    expect(screen.queryByTestId('sub-ff-subscript-spacer')).toBeNull();
  });

  it('renders prefix and suffix slots cleanly around the control', () => {
    render(
      <MagicPaperProvider>
        <MagicFormField
          testId="affix-ff"
          label="Amount"
          floatLabel="always"
          prefix={<MagicIcon icon="attach_money" size={18} />}
          suffix={<Text>USD</Text>}
        >
          <MagicTextInput testId="affix-input" />
        </MagicFormField>
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('affix-ff-prefix').textContent).toContain(
      'attach_money'
    );
    expect(screen.getByTestId('affix-ff-suffix').textContent).toBe('USD');
  });

  it('propagates disabled and size to nested MagicTextInput and works in dark palette', () => {
    const ref = createRef<View>();
    render(
      <MagicPaperProvider palette="dark-theme">
        <MagicFormField
          ref={ref}
          testId="dark-ff"
          label="API Token"
          size="lg"
          disabled
          appearance="filled"
        >
          <MagicTextInput testId="dark-input" defaultValue="tok_live" />
        </MagicFormField>
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    const input = screen.getByTestId('dark-input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(input.style.fontSize).toBe('16px');
  });

  it('renders cleanly without a label and with custom ariaLabel', () => {
    render(
      <MagicPaperProvider>
        <MagicFormField
          testId="nolabel-ff"
          ariaLabel="Quick filter"
          appearance="outlined"
          subscriptSizing="dynamic"
        >
          <MagicTextInput testId="nolabel-input" placeholder="Filter..." />
        </MagicFormField>
      </MagicPaperProvider>
    );

    expect(screen.queryByTestId('nolabel-ff-label')).toBeNull();
    expect(screen.getByTestId('nolabel-ff').getAttribute('aria-label')).toBe(
      'Quick filter'
    );
  });
});
