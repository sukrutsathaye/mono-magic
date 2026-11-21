import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useControllableState } from './use-controllable-state';

describe('useControllableState', () => {
  it('manages state internally in uncontrolled mode and notifies onChange', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: 'initial', onChange })
    );

    expect(result.current[0]).toBe('initial');

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('updated');
  });

  it('supports functional updaters including sequential updates in one tick', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: 0, onChange })
    );

    act(() => {
      result.current[1]((prev) => prev + 1);
      result.current[1]((prev) => prev + 2);
    });

    expect(result.current[0]).toBe(3);
    expect(onChange).toHaveBeenNthCalledWith(1, 1);
    expect(onChange).toHaveBeenNthCalledWith(2, 3);
  });

  it('skips redundant onChange calls when value is unchanged via Object.is', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: 'same', onChange })
    );

    act(() => {
      result.current[1]('same');
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('delegates updates in controlled mode without mutating internal value', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value, cb }: { value: boolean; cb: (v: boolean) => void }) =>
        useControllableState({ value, defaultValue: false, onChange: cb }),
      { initialProps: { value: false, cb: onChange } }
    );

    const stableSetter = result.current[1];

    act(() => {
      result.current[1]((prev) => !prev);
    });

    expect(onChange).toHaveBeenCalledWith(true);
    // Controlled value remains false until parent updates prop
    expect(result.current[0]).toBe(false);

    const nextOnChange = vi.fn();
    rerender({ value: true, cb: nextOnChange });
    expect(result.current[0]).toBe(true);
    expect(result.current[1]).toBe(stableSetter);

    act(() => {
      result.current[1](false);
    });

    expect(nextOnChange).toHaveBeenCalledWith(false);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
