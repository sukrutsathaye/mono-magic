import { useCallback, useRef, useState } from 'react';

export interface UseControllableStateOptions<T> {
  /** Controlled value. When defined (`!== undefined`), the caller owns state updates. */
  value?: T;
  /** Initial value used when operating in uncontrolled mode. */
  defaultValue: T;
  /** Change callback invoked whenever a new value is committed. */
  onChange?: (nextValue: T) => void;
}

/**
 * React 19 hook supporting both controlled and uncontrolled component state
 * without redundant `useEffect` synchronization.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): readonly [
  T,
  (next: T | ((prev: T) => T)) => void,
] {
  const [internalValue, setInternalValue] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const valueRef = useRef<T>(currentValue);
  valueRef.current = currentValue;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = valueRef.current;
      const resolved =
        typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;

      if (Object.is(resolved, prev)) {
        return;
      }

      if (!isControlled) {
        valueRef.current = resolved;
        setInternalValue(resolved);
      }

      onChangeRef.current?.(resolved);
    },
    [isControlled],
  );

  return [currentValue, setValue] as const;
}
