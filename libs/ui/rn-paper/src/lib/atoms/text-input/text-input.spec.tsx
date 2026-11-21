import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { TextInput as RNTextInput } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicFormField } from '../../molecules/form-field/form-field';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicTextInput } from './text-input';

afterEach(cleanup);

describe('MagicTextInput (bare TextInputControlProps)', () => {
  it('supports uncontrolled mode with defaultValue and calls onChange and onChangeText', () => {
    const onChange = vi.fn();
    const onChangeText = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicTextInput
          testId="bare-input"
          ariaLabel="Nickname"
          defaultValue="Ada"
          placeholder="Enter nickname"
          onChange={onChange}
          onChangeText={onChangeText}
        />
      </MagicPaperProvider>
    );

    const input = screen.getByTestId('bare-input') as HTMLInputElement;
    expect(input.value).toBe('Ada');
    expect(input.getAttribute('aria-label')).toBe('Nickname');

    fireEvent.change(input, { target: { value: 'Grace' } });
    expect(input.value).toBe('Grace');
    expect(onChange).toHaveBeenCalledWith('Grace');
    expect(onChangeText).toHaveBeenCalledWith('Grace');
  });

  it('supports controlled mode without mutating value internally', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MagicPaperProvider>
        <MagicTextInput
          testId="ctrl-input"
          ariaLabel="Controlled"
          value="initial"
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    const input = screen.getByTestId('ctrl-input') as HTMLInputElement;
    expect(input.value).toBe('initial');

    fireEvent.change(input, { target: { value: 'updated' } });
    expect(onChange).toHaveBeenCalledWith('updated');
    expect(input.value).toBe('initial');

    rerender(
      <MagicPaperProvider>
        <MagicTextInput
          testId="ctrl-input"
          ariaLabel="Controlled"
          value="updated"
          onChange={onChange}
        />
      </MagicPaperProvider>
    );
    expect(input.value).toBe('updated');
  });

  it('fires onFocus, onBlur, and onSubmit on Enter key', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onSubmit = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicTextInput
          testId="events-input"
          ariaLabel="Command"
          defaultValue="build"
          onFocus={onFocus}
          onBlur={onBlur}
          onSubmit={onSubmit}
        />
      </MagicPaperProvider>
    );

    const input = screen.getByTestId('events-input');
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('build');

    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('maps semantic input types to web input types and inputMode', () => {
    render(
      <MagicPaperProvider>
        <MagicTextInput testId="t-text" type="text" ariaLabel="Text" />
        <MagicTextInput testId="t-email" type="email" ariaLabel="Email" />
        <MagicTextInput testId="t-tel" type="tel" ariaLabel="Phone" />
        <MagicTextInput testId="t-url" type="url" ariaLabel="Website" />
        <MagicTextInput testId="t-number" type="number" ariaLabel="Count" />
        <MagicTextInput testId="t-password" type="password" ariaLabel="Secret" />
        <MagicTextInput testId="t-search" type="search" ariaLabel="Find" />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('t-text').getAttribute('type')).toBe('text');
    expect(screen.getByTestId('t-email').getAttribute('type')).toBe('email');
    expect(screen.getByTestId('t-tel').getAttribute('type')).toBe('tel');
    expect(screen.getByTestId('t-url').getAttribute('type')).toBe('url');
    expect(screen.getByTestId('t-number').getAttribute('inputmode')).toBe(
      'numeric'
    );
    expect(screen.getByTestId('t-password').getAttribute('type')).toBe(
      'password'
    );
    expect(screen.getByTestId('t-search').getAttribute('type')).toBe('search');
  });

  it('blocks edits when disabled or readOnly and exposes invalid/required/maxLength', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicTextInput
          testId="disabled-input"
          ariaLabel="Locked"
          defaultValue="fixed"
          disabled
          onChange={onChange}
          onSubmit={onSubmit}
        />
        <MagicTextInput
          testId="readonly-input"
          ariaLabel="ReadOnly"
          defaultValue="readonly-val"
          readOnly
          invalid
          required
          maxLength={20}
          autocomplete="username"
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    const disabledEl = screen.getByTestId('disabled-input') as HTMLInputElement;
    expect(disabledEl.disabled).toBe(true);
    fireEvent.change(disabledEl, { target: { value: 'nope' } });
    fireEvent.keyDown(disabledEl, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();

    const readOnlyEl = screen.getByTestId('readonly-input') as HTMLInputElement;
    expect(readOnlyEl.readOnly).toBe(true);
    expect(readOnlyEl.getAttribute('aria-invalid')).toBe('true');
    expect(readOnlyEl.getAttribute('aria-required')).toBe('true');
    expect(readOnlyEl.getAttribute('aria-readonly')).toBe('true');
    expect(readOnlyEl.getAttribute('maxlength')).toBe('20');
    fireEvent.change(readOnlyEl, { target: { value: 'attempt' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders frameless inside MagicFormField and inherits context metadata', () => {
    const ref = createRef<RNTextInput>();
    render(
      <MagicPaperProvider>
        <MagicFormField
          id="profile-email"
          label="Email"
          errorText="Invalid email"
          size="xl"
          required
        >
          <MagicTextInput ref={ref} testId="nested-input" />
        </MagicFormField>
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    const input = screen.getByTestId('nested-input') as HTMLInputElement;
    expect(input.getAttribute('id')).toBe('profile-email-control');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('profile-email-error');
    expect(input.style.fontSize).toBe('18px');
  });
});
