import { createContext, useContext, type ReactNode } from 'react';
import type {
  AtomicSize,
  FormFieldAppearance,
  FormFieldFloatLabel,
} from '@mono-magic/atomic-design-interfaces';

/**
 * Shared context provided by `MagicFormField` (via React 19 `<MagicFormFieldContext value={...}>`)
 * and consumed by bare form controls such as `MagicTextInput` and `MagicSelect`.
 */
export interface MagicFormFieldContextValue {
  /** Stable DOM id linking `<label htmlFor>` to the inner control element. */
  controlId: string;
  /** Optional DOM id of the rendered label element. */
  labelId?: string;
  /** Optional DOM id of the helper or error text element (`aria-describedby`). */
  helperId?: string;
  /** Field label text managed by `MagicFormField`. */
  label?: string;
  /** Material 3 field container style. */
  appearance: FormFieldAppearance;
  /** Atomic control size propagated from the enclosing form field. */
  size: AtomicSize;
  /** Label floating strategy. */
  floatLabel: FormFieldFloatLabel;
  /** Whether to omit the `*` indicator on required fields. */
  hideRequiredMarker: boolean;
  /** True when the field is currently displaying an error state. */
  hasError: boolean;
  /** Active validation error message, if any. */
  errorText?: string;
  /** Helper hint text displayed when there is no error. */
  hint?: string;
  /** Required state synced between the form field and inner control. */
  required?: boolean;
  /** Disabled state synced between the form field and inner control. */
  disabled?: boolean;
  /** Leading adornment slot rendered inside the control container. */
  prefix?: ReactNode;
  /** Trailing adornment slot rendered inside the control container. */
  suffix?: ReactNode;
  /** Callback for the inner control to notify focus changes. */
  setFocused?: (focused: boolean) => void;
  /** Callback for the inner control to notify filled/non-empty state changes. */
  setFilled?: (filled: boolean) => void;
  /** Callback for the inner control to propagate its `required` state upward. */
  setRequired?: (required: boolean) => void;
  /** Callback for the inner control to propagate its `disabled` state upward. */
  setDisabled?: (disabled: boolean) => void;
}

/**
 * React 19 context connecting `MagicFormField` with bare form controls.
 * Render `<MagicFormFieldContext value={contextValue}>` directly.
 */
export const MagicFormFieldContext =
  createContext<MagicFormFieldContextValue | null>(null);

/**
 * Reads the enclosing `MagicFormFieldContext`, or returns `null` when the
 * control is rendered standalone outside of `MagicFormField`.
 */
export function useMagicFormFieldContext(): MagicFormFieldContextValue | null {
  return useContext(MagicFormFieldContext);
}
