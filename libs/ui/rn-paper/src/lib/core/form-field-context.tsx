import { createContext, useContext, type ReactNode } from 'react';
import type {
  AtomicSize,
  FormFieldAppearance,
  FormFieldFloatLabel,
  FormFieldSubscriptSizing,
} from '@mono-magic/atomic-design-interfaces';

export interface MagicFormFieldContextValue {
  controlId: string;
  labelId: string;
  hintId: string;
  errorId: string;
  describedBy?: string;
  label?: string;
  hint?: string;
  errorText?: string;
  hasError: boolean;
  appearance: FormFieldAppearance;
  size: AtomicSize;
  floatLabel: FormFieldFloatLabel;
  subscriptSizing: FormFieldSubscriptSizing;
  hideRequiredMarker: boolean;
  disabled: boolean;
  required: boolean;
  focused: boolean;
  hasValue: boolean;
  setFocused: (focused: boolean) => void;
  setHasValue: (hasValue: boolean) => void;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const MagicFormFieldContext =
  createContext<MagicFormFieldContextValue | null>(null);

export interface MagicFormFieldProviderProps {
  value: MagicFormFieldContextValue;
  children: ReactNode;
}

/**
 * Provides form-field metadata and state to a single nested form-control atom
 * using React 19 `<Context value={...}>` syntax.
 */
export function MagicFormFieldProvider({
  value,
  children,
}: MagicFormFieldProviderProps) {
  return <MagicFormFieldContext value={value}>{children}</MagicFormFieldContext>;
}

export function useMagicFormFieldContext(): MagicFormFieldContextValue | null {
  return useContext(MagicFormFieldContext);
}
