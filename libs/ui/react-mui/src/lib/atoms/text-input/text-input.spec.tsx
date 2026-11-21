import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicFormField } from '../../molecules/form-field/form-field';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicTextInput } from './text-input';

afterEach(cleanup);

describe('MagicTextInput (React MUI)', () => {
  it('renders standalone in uncontrolled mode and fires onChange and onSubmit on Enter', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    const inputRef = createRef<HTMLInputElement>();

    render(
      <MagicMuiThemeProvider>
        <MagicTextInput
          ref={inputRef}
          testId="standalone-input"
          ariaLabel="Standalone text"
          defaultValue="hello"
          placeholder="Type here"
          onChange={onChange}
          onSubmit={onSubmit}
        />
      </MagicMuiThemeProvider>,
    );

    const input = screen.getByTestId('standalone-input') as HTMLInputElement;
    expect(inputRef.current).toBe(input);
    expect(input.value).toBe('hello');
    expect(input.getAttribute('aria-label')).toBe('Standalone text');

    fireEvent.change(input, { target: { value: 'hello world' } });
    expect(input.value).toBe('hello world');
    expect(onChange).toHaveBeenCalledWith('hello world');

    fireEvent.keyDown(input, { key: 'a' });
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('hello world');
  });

  it('works in controlled mode without mutating internal value unless prop updates', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicTextInput
          testId="controlled-input"
          value="initial"
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );

    const input = screen.getByTestId('controlled-input') as HTMLInputElement;
    expect(input.value).toBe('initial');

    fireEvent.change(input, { target: { value: 'next' } });
    expect(onChange).toHaveBeenCalledWith('next');
    expect(input.value).toBe('initial');

    rerender(
      <MagicMuiThemeProvider>
        <MagicTextInput
          testId="controlled-input"
          value="next"
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );
    expect(input.value).toBe('next');
  });

  it('forwards native attributes, validation constraints, focus/blur handlers, and sx arrays', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicTextInput
          id="custom-id"
          testId="attr-input"
          type="email"
          name="userEmail"
          size="xs"
          readOnly
          required
          invalid
          autocomplete="email"
          minLength={3}
          maxLength={40}
          sx={[{ borderRadius: 1 }]}
          slotProps={{ input: { 'data-custom': 'yes' } as Record<string, unknown> }}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <MagicTextInput testId="disabled-input" disabled />
      </MagicMuiThemeProvider>,
    );

    const input = screen.getByTestId('attr-input') as HTMLInputElement;
    expect(input.id).toBe('custom-id');
    expect(input.type).toBe('email');
    expect(input.name).toBe('userEmail');
    expect(input.readOnly).toBe(true);
    expect(input.required).toBe(true);
    expect(input.getAttribute('autocomplete')).toBe('email');
    expect(input.minLength).toBe(3);
    expect(input.maxLength).toBe(40);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('data-custom')).toBe('yes');

    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);

    expect(
      (screen.getByTestId('disabled-input') as HTMLInputElement).disabled,
    ).toBe(true);
  });

  it('integrates cleanly with MagicFormField in both outlined and filled appearances', () => {
    const { container } = render(
      <MagicMuiThemeProvider>
        <MagicFormField
          label="Outlined Label"
          appearance="outlined"
          hint="Helpful hint"
          prefix="mail"
          suffix="check"
        >
          <MagicTextInput testId="ctx-outlined" defaultValue="a@b.com" />
        </MagicFormField>
        <MagicFormField
          label="Filled Label"
          appearance="filled"
          errorText="Invalid field"
          prefix={<span>$</span>}
          suffix={false}
        >
          <MagicTextInput testId="ctx-filled" size="lg" />
        </MagicFormField>
      </MagicMuiThemeProvider>,
    );

    const outlined = screen.getByTestId('ctx-outlined');
    expect(outlined).toBe(screen.getByLabelText('Outlined Label'));
    expect(outlined.getAttribute('aria-describedby')).toBeTruthy();

    const filled = screen.getByTestId('ctx-filled');
    expect(filled).toBe(screen.getByLabelText('Filled Label'));
    expect(filled.getAttribute('aria-invalid')).toBe('true');
    expect(container.querySelector('.MuiFilledInput-root')).not.toBeNull();
  });

  it('works with native HTML form and FormData', () => {
    let submittedEmail = '';

    render(
      <MagicMuiThemeProvider>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            submittedEmail = String(formData.get('email') ?? '');
          }}
        >
          <MagicFormField label="Email">
            <MagicTextInput
              name="email"
              defaultValue="ada@example.com"
              testId="form-email"
            />
          </MagicFormField>
          <button type="submit">Send</button>
        </form>
      </MagicMuiThemeProvider>,
    );

    const input = screen.getByTestId('form-email');
    fireEvent.change(input, { target: { value: 'grace@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(submittedEmail).toBe('grace@example.com');
  });
});
