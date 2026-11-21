import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  ButtonShape,
  ButtonVariant,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicButton } from './button';

afterEach(cleanup);

describe('MagicButton (React MUI)', () => {
  it('renders label, forwards React 19 ref, and triggers onClick', () => {
    const onClick = vi.fn();
    const buttonRef = createRef<HTMLButtonElement>();

    render(
      <MagicMuiThemeProvider>
        <MagicButton
          ref={buttonRef}
          id="submit-btn"
          testId="magic-btn"
          type="submit"
          label="Submit"
          onClick={onClick}
        />
      </MagicMuiThemeProvider>,
    );

    const btn = screen.getByTestId('magic-btn') as HTMLButtonElement;
    expect(buttonRef.current).toBe(btn);
    expect(btn.id).toBe('submit-btn');
    expect(btn.type).toBe('submit');
    expect(btn.textContent).toContain('Submit');

    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders all 5 variants and all 7 semantic color intents', () => {
    const variants: ButtonVariant[] = [
      'filled',
      'tonal',
      'outlined',
      'elevated',
      'text',
    ];
    const colors: ColorIntent[] = [
      'primary',
      'secondary',
      'tertiary',
      'success',
      'warning',
      'error',
      'neutral',
    ];

    render(
      <MagicMuiThemeProvider>
        {variants.map((variant) => (
          <MagicButton
            key={variant}
            variant={variant}
            label={`v-${variant}`}
            testId={`variant-${variant}`}
          />
        ))}
        {colors.map((color) => (
          <MagicButton
            key={color}
            variant="outlined"
            color={color}
            label={`c-${color}`}
            testId={`color-${color}`}
          />
        ))}
      </MagicMuiThemeProvider>,
    );

    for (const variant of variants) {
      expect(screen.getByTestId(`variant-${variant}`).textContent).toContain(
        `v-${variant}`,
      );
    }
    for (const color of colors) {
      expect(screen.getByTestId(`color-${color}`).textContent).toContain(
        `c-${color}`,
      );
    }
  });

  it('supports all 5 sizes and all 4 corner shapes', () => {
    const sizes: AtomicSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    const shapes: ButtonShape[] = ['default', 'square', 'rounded', 'pill'];

    render(
      <MagicMuiThemeProvider>
        {sizes.map((size) => (
          <MagicButton
            key={size}
            size={size}
            label={`size-${size}`}
            testId={`size-${size}`}
          />
        ))}
        {shapes.map((shape) => (
          <MagicButton
            key={shape}
            shape={shape}
            label={`shape-${shape}`}
            testId={`shape-${shape}`}
          />
        ))}
      </MagicMuiThemeProvider>,
    );

    for (const size of sizes) {
      expect(screen.getByTestId(`size-${size}`)).toBeTruthy();
    }
    for (const shape of shapes) {
      expect(screen.getByTestId(`shape-${shape}`)).toBeTruthy();
    }
  });

  it('renders all 5 button kinds (default, icon, fab, mini-fab, extended-fab)', () => {
    const onIconClick = vi.fn();
    const onFabClick = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicButton
          kind="icon"
          leadingIcon="favorite"
          testId="kind-icon"
          onClick={onIconClick}
        />
        <MagicButton
          kind="icon"
          trailingIcon="close"
          shape="square"
          testId="kind-icon-trailing"
        />
        <MagicButton kind="icon" ariaLabel="Custom child" testId="kind-icon-child">
          <span>*</span>
        </MagicButton>
        <MagicButton
          kind="fab"
          leadingIcon="add"
          testId="kind-fab"
          onClick={onFabClick}
        />
        <MagicButton
          kind="mini-fab"
          leadingIcon="edit"
          ariaLabel="Edit"
          shape="rounded"
          testId="kind-mini-fab"
        />
        <MagicButton
          kind="extended-fab"
          leadingIcon="navigation"
          trailingIcon="arrow_forward"
          label="Navigate"
          testId="kind-extended-fab"
        />
        <MagicButton kind="fab" label="Custom Fab" testId="kind-fab-child">
          <span>+</span>
        </MagicButton>
      </MagicMuiThemeProvider>,
    );

    const iconBtn = screen.getByTestId('kind-icon');
    expect(iconBtn.getAttribute('aria-label')).toBe('favorite');
    fireEvent.click(iconBtn);
    expect(onIconClick).toHaveBeenCalledTimes(1);

    expect(
      screen.getByTestId('kind-icon-trailing').getAttribute('aria-label'),
    ).toBe('close');
    expect(
      screen.getByTestId('kind-icon-child').getAttribute('aria-label'),
    ).toBe('Custom child');

    const fabBtn = screen.getByTestId('kind-fab');
    expect(fabBtn.getAttribute('aria-label')).toBe('add');
    fireEvent.click(fabBtn);
    expect(onFabClick).toHaveBeenCalledTimes(1);

    expect(
      screen.getByTestId('kind-mini-fab').getAttribute('aria-label'),
    ).toBe('Edit');
    expect(screen.getByTestId('kind-extended-fab').textContent).toContain(
      'Navigate',
    );
    expect(screen.getByTestId('kind-fab-child').textContent).toContain('+');
  });

  it('supports loading state, loadingLabel, and aria-busy across kinds', () => {
    const onClick = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicButton
          label="Save"
          loading
          testId="loading-default"
          onClick={onClick}
        />
        <MagicButton
          label="Save"
          loading
          loadingLabel="Saving..."
          leadingIcon="save"
          testId="loading-with-label"
          onClick={onClick}
        />
        <MagicButton
          kind="icon"
          leadingIcon="refresh"
          ariaLabel="Refresh"
          loading
          testId="loading-icon"
        />
        <MagicButton
          kind="fab"
          leadingIcon="add"
          ariaLabel="Add"
          loading
          testId="loading-fab"
        />
        <MagicButton
          kind="mini-fab"
          leadingIcon="edit"
          ariaLabel="Edit"
          loading
          testId="loading-mini-fab"
        />
        <MagicButton
          kind="extended-fab"
          label="Send"
          loading
          loadingLabel="Sending..."
          testId="loading-extended-fab"
        />
      </MagicMuiThemeProvider>,
    );

    const defaultBtn = screen.getByTestId(
      'loading-default',
    ) as HTMLButtonElement;
    expect(defaultBtn.disabled).toBe(true);
    expect(defaultBtn.getAttribute('aria-busy')).toBe('true');

    const withLabelBtn = screen.getByTestId(
      'loading-with-label',
    ) as HTMLButtonElement;
    expect(withLabelBtn.textContent).toContain('Saving...');
    expect(withLabelBtn.disabled).toBe(true);

    expect(
      screen.getByTestId('loading-icon').getAttribute('aria-busy'),
    ).toBe('true');
    expect(
      (screen.getByTestId('loading-fab') as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      screen.getByTestId('loading-mini-fab').getAttribute('aria-busy'),
    ).toBe('true');
    expect(screen.getByTestId('loading-extended-fab').textContent).toContain(
      'Sending...',
    );

    fireEvent.click(defaultBtn);
    fireEvent.click(withLabelBtn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps button focusable with aria-disabled="true" when disabledInteractive is enabled while blocking clicks', () => {
    const onClick = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicButton
          label="Interactive Disabled"
          disabled
          disabledInteractive
          testId="interactive-disabled"
          onClick={onClick}
        />
      </MagicMuiThemeProvider>,
    );

    const btn = screen.getByTestId(
      'interactive-disabled',
    ) as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
    expect(btn.getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('supports string and ReactNode icons, custom children overriding label, fullWidth, disableRipple, and sx arrays', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicButton
          label="Fallback"
          leadingIcon={<span data-testid="custom-leading">L</span>}
          trailingIcon="arrow_forward"
          fullWidth
          disableRipple
          sx={[{ letterSpacing: 1 }]}
          testId="rich-btn"
        >
          <strong data-testid="custom-child">Projected</strong>
        </MagicButton>
      </MagicMuiThemeProvider>,
    );

    const btn = screen.getByTestId('rich-btn');
    expect(screen.getByTestId('custom-leading').textContent).toBe('L');
    expect(screen.getByTestId('custom-child').textContent).toBe('Projected');
    expect(btn.textContent).not.toContain('Fallback');
    expect(btn.textContent).toContain('arrow_forward');
  });
});
