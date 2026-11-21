import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useControllableState } from './use-controllable-state';

describe('useControllableState', () => {
  it('manages internal state in uncontrolled mode and invokes onChange', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: 'initial', onChange }),
    );

    expect(result.current[0]).toBe('initial');

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('updated');
  });

  it('supports functional updates and sequential updates in uncontrolled mode', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: 1, onChange }),
    );

    act(() => {
      result.current[1]((prev) => prev + 2);
      result.current[1]((prev) => prev * 3);
    });

    expect(result.current[0]).toBe(9);
    expect(onChange).toHaveBeenNthCalledWith(1, 3);
    expect(onChange).toHaveBeenNthCalledWith(2, 9);
  });

  it('ignores no-op updates where next value equals current value', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: 'same', onChange }),
    );

    act(() => {
      result.current[1]('same');
    });

    expect(result.current[0]).toBe('same');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('delegates updates in controlled mode without mutating internal value unless prop updates', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) =>
        useControllableState({ value, defaultValue: 'fallback', onChange }),
      { initialProps: { value: 'controlled-a' } },
    );

    expect(result.current[0]).toBe('controlled-a');

    act(() => {
      result.current[1]('controlled-b');
    });

    // Controlled prop did not change yet, so displayed value stays 'controlled-a'
    expect(result.current[0]).toBe('controlled-a');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('controlled-b');

    // Functional update still computes from current controlled value
    act(() => {
      result.current[1]((prev) => `${prev}-next`);
    });
    expect(onChange).toHaveBeenLastCalledWith('controlled-a-next');

    // Parent updates prop
    rerender({ value: 'controlled-b' });
    expect(result.current[0]).toBe('controlled-b');
  });

  it('handles transition from controlled to uncontrolled gracefully', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value?: string }) =>
        useControllableState({ value, defaultValue: 'default', onChange }),
      { initialProps: { value: 'controlled' as string | undefined } },
    );

    expect(result.current[0]).toBe('controlled');

    rerender({ value: undefined });
    expect(result.current[0]).toBe('default');

    act(() => {
      result.current[1]('after-uncontrolled');
    });
    expect(result.current[0]).toBe('after-uncontrolled');
    expect(onChange).toHaveBeenCalledWith('after-uncontrolled');
  });
});
