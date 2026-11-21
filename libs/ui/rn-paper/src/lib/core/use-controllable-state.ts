import { useCallback, useRef, useState } from 'react';

export interface UseControllableStateOptions<T> {
  /** Controlled value. When `undefined`, the hook manages state internally. */
  value?: T;
  /** Initial value used in uncontrolled mode. */
  defaultValue: T;
  /** Change callback invoked whenever the value transitions. */
  onChange?: (value: T) => void;
}

export type ControllableStateUpdater<T> = T | ((prev: T) => T);

/**
 * Idiomatic React 19 controlled / uncontrolled state hook.
 * Supports functional updaters and avoids stale closures via ref-backed latest callbacks.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): readonly [
  T,
  (next: ControllableStateUpdater<T>) => void,
] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const isControlledRef = useRef(isControlled);
  const currentValueRef = useRef(currentValue);
  const onChangeRef = useRef(onChange);

  isControlledRef.current = isControlled;
  currentValueRef.current = currentValue;
  onChangeRef.current = onChange;

  const setValue = useCallback((next: ControllableStateUpdater<T>) => {
    const prev = currentValueRef.current;
    const resolved =
      typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;

    if (Object.is(resolved, prev)) {
      return;
    }

    if (!isControlledRef.current) {
      currentValueRef.current = resolved;
      setUncontrolledValue(resolved);
    }

    onChangeRef.current?.(resolved);
  }, []);

  return [currentValue, setValue] as const;
}
