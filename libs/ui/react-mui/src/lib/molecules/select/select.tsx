import {
  useEffect,
  useId,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import type { SxProps, Theme } from '@mui/material/styles';
import type {
  AtomicSize,
  SelectMoleculeProps,
  SelectOption,
  SelectOptionGroup,
} from '@mono-magic/atomic-design-interfaces';
import { useMagicFormFieldContext } from '../../core/form-field-context';
import { useControllableState } from '../../core/use-controllable-state';
import { MAGIC_SIZE_METRICS } from '../../theme/mui-theme';
import { MagicFormField } from '../form-field/form-field';

/**
 * Props for {@link MagicSelect}, extending {@link SelectMoleculeProps}
 * with controlled/uncontrolled value handling and React 19 / MUI v9 ergonomics.
 */
export interface MagicSelectProps<T = string | number>
  extends SelectMoleculeProps<T> {
  /** Initial selected value (or array in `multiple` mode) for uncontrolled usage. */
  defaultValue?: T | readonly T[] | null;
  /** Native form input `name` attribute. */
  name?: string;
  /** Whether the select stretches to fill its container width. Defaults to `true`. */
  fullWidth?: boolean;
  /** Invoked whenever the user selects or deselects options. */
  onChange?: (value: T | T[] | null) => void;
  /** Invoked when the dropdown panel opens (`true`) or closes (`false`). */
  onOpenChange?: (opened: boolean) => void;
  /** Optional MUI `sx` overrides applied to the outer `MagicFormField` (or inner `Select` when inside an existing `MagicFormField`). */
  sx?: SxProps<Theme>;
  /** Optional CSS class name. */
  className?: string;
  /** React 19 ref forwarded directly to the outer `FormControl` `<div>` element. */
  ref?: Ref<HTMLDivElement>;
}

const SELECT_VERTICAL_PADDING: Record<AtomicSize, string> = {
  xs: '4px',
  sm: '6px',
  md: '8.5px',
  lg: '12px',
  xl: '15.5px',
};

function isValueEmpty<T>(val: T | readonly T[] | null | undefined): boolean {
  if (val === null || val === undefined || val === '') {
    return true;
  }
  if (Array.isArray(val)) {
    return val.length === 0;
  }
  return false;
}

interface MagicSelectControlProps<T = string | number> {
  id?: string;
  testId?: string;
  ariaLabel?: string;
  name?: string;
  options: readonly SelectOption<T>[];
  optionGroups: readonly SelectOptionGroup<T>[];
  currentValue: T | readonly T[] | null;
  setCurrentValue: (next: T | readonly T[] | null) => void;
  placeholder: string;
  multiple: boolean;
  required: boolean;
  disabled: boolean;
  disableRipple: boolean;
  customTriggerSummary: boolean;
  panelClass?: string;
  size: AtomicSize;
  fullWidth: boolean;
  onOpenChange?: (opened: boolean) => void;
  sx?: SxProps<Theme>;
  className?: string;
}

function MagicSelectControl<T = string | number>({
  id,
  testId,
  ariaLabel,
  name,
  options,
  optionGroups,
  currentValue,
  setCurrentValue,
  placeholder,
  multiple,
  required,
  disabled,
  disableRipple,
  customTriggerSummary,
  panelClass,
  size,
  fullWidth,
  onOpenChange,
  sx,
  className,
}: MagicSelectControlProps<T>) {
  const fieldCtx = useMagicFormFieldContext();
  const generatedId = useId();
  const [focused, setFocused] = useState(false);

  const resolvedId = id ?? fieldCtx?.controlId ?? `${generatedId}-select`;
  const resolvedSize: AtomicSize = fieldCtx?.size ?? size;
  const resolvedDisabled = disabled || Boolean(fieldCtx?.disabled);
  const resolvedRequired = required || Boolean(fieldCtx?.required);
  const resolvedError = Boolean(fieldCtx?.hasError);
  const resolvedAppearance = fieldCtx?.appearance ?? 'outlined';
  const showPlaceholder =
    !fieldCtx?.label || fieldCtx.floatLabel === 'always' || focused;

  const isFilled = !isValueEmpty(currentValue);

  const setFieldFilled = fieldCtx?.setFilled;
  const setFieldRequired = fieldCtx?.setRequired;
  const setFieldDisabled = fieldCtx?.setDisabled;
  const setFieldFocused = fieldCtx?.setFocused;

  useEffect(() => {
    setFieldFilled?.(isFilled);
  }, [setFieldFilled, isFilled]);

  useEffect(() => {
    setFieldRequired?.(required);
  }, [setFieldRequired, required]);

  useEffect(() => {
    setFieldDisabled?.(disabled);
  }, [setFieldDisabled, disabled]);

  useEffect(() => {
    return () => {
      setFieldFocused?.(false);
    };
  }, [setFieldFocused]);

  const allOptions = useMemo(
    () => [...options, ...optionGroups.flatMap((group) => group.options)],
    [options, optionGroups],
  );

  const resolveOptionLabel = (item: T): string => {
    const match = allOptions.find((opt) => Object.is(opt.value, item));
    return match ? match.label : String(item);
  };

  const formatTriggerValue = (selected: unknown): ReactNode => {
    if (multiple) {
      const arr = Array.isArray(selected) ? (selected as T[]) : [];
      if (arr.length === 0) {
        return showPlaceholder && placeholder ? (
          <Box component="span" sx={{ color: 'text.secondary', opacity: 0.7 }}>
            {placeholder}
          </Box>
        ) : (
          ''
        );
      }
      const firstLabel = resolveOptionLabel(arr[0]);
      if (customTriggerSummary && arr.length > 1) {
        const extraCount = arr.length - 1;
        const suffix = extraCount === 1 ? 'other' : 'others';
        return `${firstLabel} (+${extraCount} ${suffix})`;
      }
      return arr.map(resolveOptionLabel).join(', ');
    }

    if (selected === null || selected === undefined || selected === '') {
      const explicitEmptyOption = allOptions.find((opt) =>
        Object.is(opt.value, selected as T),
      );
      if (explicitEmptyOption) {
        return explicitEmptyOption.label;
      }
      return showPlaceholder && placeholder ? (
        <Box component="span" sx={{ color: 'text.secondary', opacity: 0.7 }}>
          {placeholder}
        </Box>
      ) : (
        ''
      );
    }

    return resolveOptionLabel(selected as T);
  };

  const selectedArray: readonly T[] = useMemo(() => {
    if (!multiple) {
      return [];
    }
    return Array.isArray(currentValue) ? (currentValue as readonly T[]) : [];
  }, [multiple, currentValue]);

  const muiValue = useMemo(() => {
    if (multiple) {
      return Array.isArray(currentValue) ? [...currentValue] : [];
    }
    if (currentValue === null || currentValue === undefined) {
      return '';
    }
    return currentValue;
  }, [multiple, currentValue]);

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const raw = event.target.value;
    if (multiple) {
      const nextArray = Array.isArray(raw) ? (raw as T[]) : [];
      setCurrentValue(nextArray);
    } else {
      const nextVal = raw === '' ? null : (raw as T);
      setCurrentValue(nextVal);
    }
  };

  const handleFocus = () => {
    setFocused(true);
    setFieldFocused?.(true);
  };

  const handleBlur = () => {
    setFocused(false);
    setFieldFocused?.(false);
  };

  const handleOpen = () => {
    setFocused(true);
    setFieldFocused?.(true);
    onOpenChange?.(true);
  };

  const handleClose = () => {
    onOpenChange?.(false);
  };

  const metrics = MAGIC_SIZE_METRICS[resolvedSize];
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const notched = fieldCtx?.label
    ? fieldCtx.floatLabel === 'always' ||
      focused ||
      isFilled ||
      Boolean(fieldCtx.prefix)
    : undefined;

  const menuItems: ReactNode[] = [];

  optionGroups.forEach((group, groupIndex) => {
    menuItems.push(
      <ListSubheader
        key={`group-header-${group.label}-${groupIndex}`}
        disableSticky
        sx={{
          fontWeight: 600,
          color: group.disabled ? 'text.disabled' : 'text.secondary',
        }}
      >
        {group.label}
      </ListSubheader>,
    );
    group.options.forEach((opt, optIndex) => {
      const isOptionDisabled = Boolean(group.disabled || opt.disabled);
      const isSelected = multiple
        ? selectedArray.some((item) => Object.is(item, opt.value))
        : Object.is(currentValue, opt.value);

      menuItems.push(
        <MenuItem
          key={`group-${groupIndex}-opt-${String(opt.value)}-${optIndex}`}
          value={opt.value as unknown as string | number}
          disabled={isOptionDisabled}
          disableRipple={disableRipple}
          data-testid={
            testId ? `${testId}-option-${String(opt.value)}` : undefined
          }
          sx={{ pl: 3 }}
        >
          {multiple ? (
            <Checkbox
              size="small"
              checked={isSelected}
              disabled={isOptionDisabled}
              disableRipple={disableRipple}
              sx={{ p: 0.5, mr: 1 }}
            />
          ) : null}
          <ListItemText primary={opt.label} />
        </MenuItem>,
      );
    });
  });

  options.forEach((opt, optIndex) => {
    const isOptionDisabled = Boolean(opt.disabled);
    const isSelected = multiple
      ? selectedArray.some((item) => Object.is(item, opt.value))
      : Object.is(currentValue, opt.value);

    menuItems.push(
      <MenuItem
        key={`opt-${String(opt.value)}-${optIndex}`}
        value={opt.value as unknown as string | number}
        disabled={isOptionDisabled}
        disableRipple={disableRipple}
        data-testid={
          testId ? `${testId}-option-${String(opt.value)}` : undefined
        }
      >
        {multiple ? (
          <Checkbox
            size="small"
            checked={isSelected}
            disabled={isOptionDisabled}
            disableRipple={disableRipple}
            sx={{ p: 0.5, mr: 1 }}
          />
        ) : null}
        <ListItemText primary={opt.label} />
      </MenuItem>,
    );
  });

  return (
    <Select
      id={resolvedId}
      name={name}
      labelId={fieldCtx?.labelId}
      label={resolvedAppearance === 'outlined' ? fieldCtx?.label : undefined}
      notched={resolvedAppearance === 'outlined' ? notched : undefined}
      variant={resolvedAppearance}
      multiple={multiple}
      displayEmpty
      value={muiValue as unknown}
      renderValue={formatTriggerValue}
      disabled={resolvedDisabled}
      required={resolvedRequired}
      error={resolvedError}
      fullWidth={fullWidth}
      size={resolvedSize === 'xs' || resolvedSize === 'sm' ? 'small' : 'medium'}
      className={className}
      onChange={handleChange as (event: SelectChangeEvent<unknown>) => void}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onOpen={handleOpen}
      onClose={handleClose}
      inputProps={{
        'aria-label': ariaLabel ?? (!fieldCtx?.label ? placeholder : undefined),
        'aria-describedby': fieldCtx?.helperId,
        'aria-invalid': resolvedError || undefined,
      }}
      SelectDisplayProps={
        (testId ? { 'data-testid': testId } : undefined) as
          | HTMLAttributes<HTMLDivElement>
          | undefined
      }
      MenuProps={{
        slotProps: {
          paper: {
            className: panelClass,
            sx: { borderRadius: 2, mt: 0.5 },
          },
        },
      }}
      sx={[
        {
          minHeight: metrics.height,
          fontSize: metrics.fontSize,
          '& .MuiSelect-select': {
            py: SELECT_VERTICAL_PADDING[resolvedSize],
          },
        },
        ...extraSx,
      ]}
    >
      {menuItems}
    </Select>
  );
}

/**
 * Dropdown select molecule composing {@link MagicFormField} and MUI v9 `Select`.
 *
 * Supports flat `options`, grouped `optionGroups` (`ListSubheader` + `MenuItem`),
 * single and `multiple` selection (with checkboxes), optional `"First (+N other/others)"`
 * `customTriggerSummary`, and full `MagicFormField` capabilities (`label`, `hint`,
 * `errorText`, `appearance`, `size`, `floatLabel`, `subscriptSizing`, `hideRequiredMarker`).
 * Can also be rendered directly as a child inside an external `<MagicFormField>`.
 */
export function MagicSelect<T = string | number>({
  id,
  testId,
  ariaLabel,
  label,
  hint,
  errorText,
  appearance = 'outlined',
  size = 'md',
  floatLabel = 'auto',
  subscriptSizing = 'fixed',
  hideRequiredMarker = false,
  options = [],
  optionGroups = [],
  value,
  defaultValue,
  placeholder = 'Select an option',
  multiple = false,
  required = false,
  disabled = false,
  disableRipple = false,
  customTriggerSummary = false,
  panelClass,
  name,
  fullWidth = true,
  onChange,
  onOpenChange,
  sx,
  className,
  ref,
}: MagicSelectProps<T>) {
  const parentFieldCtx = useMagicFormFieldContext();

  const resolvedDefaultValue: T | readonly T[] | null =
    defaultValue !== undefined ? defaultValue : multiple ? [] : null;

  const [currentValue, setCurrentValue] = useControllableState<
    T | readonly T[] | null
  >({
    value,
    defaultValue: resolvedDefaultValue,
    onChange: (next) => {
      if (Array.isArray(next)) {
        onChange?.([...next] as T[]);
      } else {
        onChange?.(next as T | null);
      }
    },
  });

  if (parentFieldCtx) {
    return (
      <MagicSelectControl<T>
        id={id}
        testId={testId}
        ariaLabel={ariaLabel}
        name={name}
        options={options}
        optionGroups={optionGroups}
        currentValue={currentValue}
        setCurrentValue={setCurrentValue}
        placeholder={placeholder}
        multiple={multiple}
        required={required}
        disabled={disabled}
        disableRipple={disableRipple}
        customTriggerSummary={customTriggerSummary}
        panelClass={panelClass}
        size={size}
        fullWidth={fullWidth}
        onOpenChange={onOpenChange}
        sx={sx}
        className={className}
      />
    );
  }

  return (
    <MagicFormField
      ref={ref}
      testId={testId ? `${testId}-field` : undefined}
      label={label}
      hint={hint}
      errorText={errorText}
      appearance={appearance}
      size={size}
      floatLabel={floatLabel}
      subscriptSizing={subscriptSizing}
      hideRequiredMarker={hideRequiredMarker}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      sx={sx}
      className={className}
    >
      <MagicSelectControl<T>
        id={id}
        testId={testId}
        ariaLabel={ariaLabel}
        name={name}
        options={options}
        optionGroups={optionGroups}
        currentValue={currentValue}
        setCurrentValue={setCurrentValue}
        placeholder={placeholder}
        multiple={multiple}
        required={required}
        disabled={disabled}
        disableRipple={disableRipple}
        customTriggerSummary={customTriggerSummary}
        panelClass={panelClass}
        size={size}
        fullWidth={fullWidth}
        onOpenChange={onOpenChange}
      />
    </MagicFormField>
  );
}
