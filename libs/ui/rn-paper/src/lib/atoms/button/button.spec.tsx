import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Text, View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  ButtonShape,
  ButtonVariant,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import {
  MAGIC_PAPER_SHAPE_RADIUS,
  MagicPaperProvider,
} from '../../theme/paper-theme';
import { MagicButton } from './button';

afterEach(cleanup);

describe('MagicButton', () => {
  it('renders default filled button, fires onPress and onClick, and forwards React 19 ref', () => {
    const onPress = vi.fn();
    const onClick = vi.fn();
    const ref = createRef<View>();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicButton
          ref={ref}
          id="submit-btn"
          testId="rn-btn"
          label="Submit"
          onPress={onPress}
          onClick={onClick}
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    const btn = screen.getByTestId('rn-btn');
    expect(btn.textContent).toContain('Submit');

    fireEvent.click(btn);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('supports children taking precedence over label', () => {
    render(
      <MagicPaperProvider>
        <MagicButton label="Ignored" testId="children-btn">
          Projected Action
        </MagicButton>
      </MagicPaperProvider>
    );

    const btn = screen.getByTestId('children-btn');
    expect(btn.textContent).toContain('Projected Action');
    expect(btn.textContent).not.toContain('Ignored');
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
      <MagicPaperProvider palette="azure-blue">
        {variants.map((variant) => (
          <MagicButton
            key={variant}
            variant={variant}
            label={`Var-${variant}`}
            testId={`var-${variant}`}
          />
        ))}
        {colors.map((color) => (
          <MagicButton
            key={color}
            variant="outlined"
            color={color}
            label={`Col-${color}`}
            testId={`col-${color}`}
          />
        ))}
      </MagicPaperProvider>
    );

    for (const variant of variants) {
      expect(screen.getByTestId(`var-${variant}`).textContent).toContain(
        `Var-${variant}`
      );
    }
    for (const color of colors) {
      expect(screen.getByTestId(`col-${color}`).textContent).toContain(
        `Col-${color}`
      );
    }
  });

  it('renders all 5 sizes and all 4 shapes with expected corner radii', () => {
    const sizes: AtomicSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    const shapes: ButtonShape[] = ['default', 'square', 'rounded', 'pill'];

    render(
      <MagicPaperProvider>
        {sizes.map((size) => (
          <MagicButton
            key={size}
            size={size}
            label={`Size-${size}`}
            testId={`size-${size}`}
          />
        ))}
        {shapes.map((shape) => (
          <MagicButton
            key={shape}
            shape={shape}
            label={`Shape-${shape}`}
            testId={`shape-${shape}`}
          />
        ))}
      </MagicPaperProvider>
    );

    for (const size of sizes) {
      expect(screen.getByTestId(`size-${size}`)).toBeTruthy();
    }
    for (const shape of shapes) {
      const container = screen.getByTestId(`shape-${shape}-container`);
      const expectedRadius = `${MAGIC_PAPER_SHAPE_RADIUS[shape]}px`;
      expect(container.style.borderTopLeftRadius).toBe(expectedRadius);
      expect(container.style.borderBottomRightRadius).toBe(expectedRadius);
    }
  });

  it('supports leadingIcon, trailingIcon, both simultaneously, and custom ReactNode icons', () => {
    render(
      <MagicPaperProvider>
        <MagicButton
          testId="btn-lead"
          label="Save"
          leadingIcon="check"
        />
        <MagicButton
          testId="btn-trail"
          label="Next"
          trailingIcon="arrow_forward"
        />
        <MagicButton
          testId="btn-both"
          label="Continue"
          leadingIcon="check"
          trailingIcon="arrow_forward"
        />
        <MagicButton
          testId="btn-node"
          label="Custom"
          leadingIcon={
            <View testID="custom-lead-node">
              <Text>★</Text>
            </View>
          }
          trailingIcon={
            <View testID="custom-trail-node">
              <Text>→</Text>
            </View>
          }
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('btn-lead').textContent).toContain('check');
    expect(screen.getByTestId('btn-trail').textContent).toContain(
      'arrow_forward'
    );
    const both = screen.getByTestId('btn-both');
    expect(both.textContent).toContain('check');
    expect(both.textContent).toContain('Continue');
    expect(both.textContent).toContain('arrow_forward');
    expect(screen.getByTestId('custom-lead-node').textContent).toBe('★');
    expect(screen.getByTestId('custom-trail-node').textContent).toBe('→');
  });

  it('renders loading state with aria-busy, blocks press, and swaps to loadingLabel', () => {
    const onPress = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicButton
          testId="loading-btn"
          label="Save"
          loading
          loadingLabel="Saving..."
          onPress={onPress}
        />
      </MagicPaperProvider>
    );

    const btn = screen.getByTestId('loading-btn');
    expect(btn.textContent).toContain('Saving...');
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(btn.getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(btn);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('handles disabled vs disabledInteractive cleanly', () => {
    const onPress = vi.fn();
    const onInteractivePress = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicButton
          testId="disabled-btn"
          label="Disabled"
          disabled
          onPress={onPress}
        />
        <MagicButton
          testId="interactive-disabled-btn"
          label="Tooltip Disabled"
          variant="outlined"
          disabled
          disabledInteractive
          disableRipple
          fullWidth
          onPress={onInteractivePress}
        />
      </MagicPaperProvider>
    );

    const disabledBtn = screen.getByTestId('disabled-btn');
    expect(disabledBtn.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(disabledBtn);
    expect(onPress).not.toHaveBeenCalled();

    const interactiveBtn = screen.getByTestId('interactive-disabled-btn');
    expect(interactiveBtn.getAttribute('aria-disabled')).toBe('true');
    expect(interactiveBtn.getAttribute('tabindex')).toBe('0');
    fireEvent.click(interactiveBtn);
    expect(onInteractivePress).not.toHaveBeenCalled();
  });

  it('renders kind="icon" with all variants, shape override, fallback aria-label, and press handling', () => {
    const onPress = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicButton
          kind="icon"
          variant="filled"
          leadingIcon="favorite"
          testId="icon-filled"
          onPress={onPress}
        />
        <MagicButton
          kind="icon"
          variant="tonal"
          color="secondary"
          trailingIcon="settings"
          shape="square"
          testId="icon-tonal"
        />
        <MagicButton
          kind="icon"
          variant="outlined"
          color="error"
          leadingIcon="delete"
          ariaLabel="Delete item"
          testId="icon-outlined"
        />
        <MagicButton
          kind="icon"
          variant="elevated"
          leadingIcon="star"
          testId="icon-elevated"
        />
        <MagicButton
          kind="icon"
          variant="text"
          disabled
          disabledInteractive
          testId="icon-fallback"
          onPress={onPress}
        />
      </MagicPaperProvider>
    );

    const filled = screen.getByTestId('icon-filled');
    expect(filled.getAttribute('aria-label')).toBe('favorite');
    fireEvent.click(filled);
    expect(onPress).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId('icon-outlined').getAttribute('aria-label')).toBe(
      'Delete item'
    );
    expect(screen.getByTestId('icon-tonal').getAttribute('aria-label')).toBe(
      'settings'
    );
    expect(screen.getByTestId('icon-fallback').getAttribute('aria-label')).toBe(
      'Icon button'
    );
    fireEvent.click(screen.getByTestId('icon-fallback'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders kind="fab", "mini-fab", and "extended-fab" across variants, sizes, and loading states', () => {
    const onPress = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicButton
          kind="fab"
          variant="filled"
          leadingIcon="add"
          ariaLabel="Add item"
          testId="fab-btn"
          onPress={onPress}
        />
        <MagicButton
          kind="mini-fab"
          variant="tonal"
          color="tertiary"
          leadingIcon="edit"
          shape="rounded"
          testId="mini-fab-btn"
        />
        <MagicButton
          kind="fab"
          variant="outlined"
          color="success"
          size="lg"
          testId="fab-outlined"
        />
        <MagicButton
          kind="fab"
          variant="elevated"
          color="warning"
          leadingIcon="bolt"
          testId="fab-elevated"
        />
        <MagicButton
          kind="fab"
          variant="text"
          leadingIcon="share"
          disabled
          disabledInteractive
          testId="fab-disabled-int"
          onPress={onPress}
        />
        <MagicButton
          kind="extended-fab"
          leadingIcon="navigation"
          label="Navigate"
          testId="ext-fab-btn"
          onPress={onPress}
        />
        <MagicButton
          kind="extended-fab"
          leadingIcon="send"
          label="Send"
          loading
          loadingLabel="Sending..."
          testId="ext-fab-loading"
          onPress={onPress}
        />
      </MagicPaperProvider>
    );

    const fab = screen.getByTestId('fab-btn');
    expect(fab.getAttribute('aria-label')).toBe('Add item');
    fireEvent.click(fab);
    expect(onPress).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId('mini-fab-btn').getAttribute('aria-label')).toBe(
      'edit'
    );
    expect(screen.getByTestId('fab-outlined').getAttribute('aria-label')).toBe(
      'Floating action button'
    );

    const extFab = screen.getByTestId('ext-fab-btn');
    expect(extFab.textContent).toContain('Navigate');
    fireEvent.click(extFab);
    expect(onPress).toHaveBeenCalledTimes(2);

    const loadingExt = screen.getByTestId('ext-fab-loading');
    expect(loadingExt.textContent).toContain('Sending...');
    expect(loadingExt.getAttribute('aria-busy')).toBe('true');
    fireEvent.click(loadingExt);
    expect(onPress).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByTestId('fab-disabled-int'));
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('reacts dynamically to theme palette changes via MagicPaperProvider', () => {
    const { rerender } = render(
      <MagicPaperProvider palette="azure-blue">
        <MagicButton label="Theme Check" testId="theme-btn" />
      </MagicPaperProvider>
    );

    const lightBg =
      screen.getByTestId('theme-btn-container').style.backgroundColor;

    rerender(
      <MagicPaperProvider palette="rose-red">
        <MagicButton label="Theme Check" testId="theme-btn" />
      </MagicPaperProvider>
    );

    const roseBg =
      screen.getByTestId('theme-btn-container').style.backgroundColor;

    expect(lightBg).toBeTruthy();
    expect(roseBg).toBeTruthy();
    expect(roseBg).not.toBe(lightBg);
  });
});
