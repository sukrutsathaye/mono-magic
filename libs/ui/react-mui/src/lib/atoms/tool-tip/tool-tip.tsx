import type { ReactElement, Ref } from 'react';
import Box from '@mui/material/Box';
import MuiTooltip, {
  type TooltipProps as MuiTooltipProps,
} from '@mui/material/Tooltip';
import type { SxProps, Theme } from '@mui/material/styles';
import type {
  ToolTipAtomProps,
  ToolTipPosition,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButton } from '../button/button';

/**
 * Props for {@link MagicToolTip}, extending {@link ToolTipAtomProps} with
 * React 19 / MUI v9 ergonomics (`children`, `onOpen`, `onClose`, `sx`,
 * `slotProps`, `className`, and direct `ref` prop).
 */
export interface MagicToolTipProps extends ToolTipAtomProps {
  /** Single React element used as the tooltip anchor trigger; falls back to a `MagicButton`. */
  children?: ReactElement<Record<string, unknown>>;
  /** Callback fired when the tooltip opens. */
  onOpen?: () => void;
  /** Callback fired when the tooltip closes. */
  onClose?: () => void;
  /** Optional MUI `sx` overrides. */
  sx?: SxProps<Theme>;
  /** Optional MUI `slotProps` forwarded to `<Tooltip>`. */
  slotProps?: MuiTooltipProps['slotProps'];
  /** Optional CSS class name forwarded to the trigger wrapper. */
  className?: string;
  /** React 19 ref forwarded to the tooltip wrapper / trigger element. */
  ref?: Ref<HTMLDivElement>;
}

const TOOLTIP_PLACEMENT_MAP: Record<
  ToolTipPosition,
  NonNullable<MuiTooltipProps['placement']>
> = {
  above: 'top',
  below: 'bottom',
  left: 'left',
  right: 'right',
  before: 'left',
  after: 'right',
};

/**
 * Material 3 tooltip atom wrapping MUI's `Tooltip` with cross-platform
 * directional placement (`above`, `below`, `left`, `right`, `before`, `after`),
 * configurable show/hide delays, touch gesture modes, and a focusable fallback
 * button trigger when `children` is omitted.
 */
export function MagicToolTip({
  id,
  testId,
  ariaLabel,
  message,
  label = 'Hover me',
  position = 'above',
  showDelay = 0,
  hideDelay = 0,
  touchGestures = 'auto',
  disabled = false,
  children,
  onOpen,
  onClose,
  sx,
  slotProps,
  className,
  ref,
}: MagicToolTipProps) {
  const isSuppressed = disabled || !message;
  const enterTouchDelay =
    touchGestures === 'off' ? 999999 : touchGestures === 'on' ? 0 : 700;

  const fallbackTrigger = (
    <MagicButton
      label={label}
      variant="outlined"
      ariaLabel={ariaLabel ?? label}
      testId={testId ? `${testId}-trigger` : undefined}
    />
  );

  const triggerNode = (
    <Box
      ref={ref}
      component="span"
      id={id}
      data-testid={testId}
      aria-label={ariaLabel}
      className={className}
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children ?? fallbackTrigger}
    </Box>
  );

  return (
    <MuiTooltip
      title={isSuppressed ? '' : message}
      placement={TOOLTIP_PLACEMENT_MAP[position] ?? 'top'}
      enterDelay={showDelay}
      leaveDelay={hideDelay}
      enterTouchDelay={enterTouchDelay}
      disableHoverListener={isSuppressed}
      disableFocusListener={isSuppressed}
      disableTouchListener={isSuppressed || touchGestures === 'off'}
      onOpen={onOpen ? () => onOpen() : undefined}
      onClose={onClose ? () => onClose() : undefined}
      slotProps={slotProps}
    >
      {triggerNode}
    </MuiTooltip>
  );
}
