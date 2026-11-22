import { useId, type ReactNode, type Ref } from 'react';
import Box from '@mui/material/Box';
import Dialog, { type DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import type {
  DialogActionItem,
  DialogMoleculeProps,
  DialogSize,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButton } from '../../atoms/button/button';

/**
 * Reason emitted when {@link MagicDialog} requests closure.
 */
export type MagicDialogCloseReason =
  | 'backdropClick'
  | 'escapeKeyDown'
  | 'closeButton';

/**
 * Props for {@link MagicDialog}, extending {@link DialogMoleculeProps} with
 * React 19 / MUI v9 slot composition, portal controls, and event callbacks.
 */
export interface MagicDialogProps extends DialogMoleculeProps {
  /** Invoked when the user triggers dismissal via close button, backdrop, or Escape key. */
  onClose?: (reason: MagicDialogCloseReason) => void;
  /** Invoked when an enabled footer action button from `actions` is clicked. */
  onActionClick?: (action: DialogActionItem) => void;
  /** Custom React content rendered in place of the default header title/subtitle. */
  headerSlot?: ReactNode;
  /** Custom React content rendered alongside or in place of `actions` in the footer. */
  footerSlot?: ReactNode;
  /** Body content rendered inside `DialogContent` alongside `content`. */
  children?: ReactNode;
  /** Disable React portal rendering so the dialog mounts inline within its parent container. */
  disablePortal?: boolean;
  /** Optional custom portal container element or resolver function. */
  container?: DialogProps['container'];
  /** Accessible label for the close icon button. Defaults to `'Close dialog'`. */
  closeButtonAriaLabel?: string;
  /** Optional MUI `sx` overrides applied to the root `Dialog`. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name applied to the root `Dialog`. */
  className?: string;
  /** React 19 ref forwarded directly to the underlying `Dialog` root `<div>` element. */
  ref?: Ref<HTMLDivElement>;
}

const DIALOG_MAX_WIDTH_MAP: Record<
  Exclude<DialogSize, 'fullscreen'>,
  DialogProps['maxWidth']
> = {
  sm: 'xs',
  md: 'sm',
  lg: 'md',
};

/**
 * Material 3 modal dialog molecule composing MUI v9 `Dialog`, header title/subtitle
 * with optional close icon button, scrollable body content, and {@link MagicButton}
 * action footer.
 *
 * Supports all 4 contract sizes (`sm`, `md`, `lg`, `fullscreen`), `dismissible`,
 * `closeOnBackdropClick`, `closeOnEscape`, `showCloseButton`, `scrollable`,
 * `alignActions` (`start` / `end`), and full ARIA dialog semantics.
 */
export function MagicDialog({
  id,
  testId,
  ariaLabel,
  open = false,
  title,
  subtitle,
  content,
  size = 'md',
  dismissible = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  scrollable = false,
  actions = [],
  alignActions = 'end',
  onClose,
  onActionClick,
  headerSlot,
  footerSlot,
  children,
  disablePortal = false,
  container,
  closeButtonAriaLabel = 'Close dialog',
  sx,
  className,
  ref,
}: MagicDialogProps) {
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  const titleId = `${resolvedId}-title`;
  const descriptionId = `${resolvedId}-description`;

  const isFullscreen = size === 'fullscreen';
  const canDismissOnBackdrop = dismissible && closeOnBackdropClick;
  const canDismissOnEscape = dismissible && closeOnEscape;
  const renderCloseButton = dismissible && showCloseButton;

  const hasHeader = Boolean(headerSlot || title || subtitle || renderCloseButton);
  const hasBody = Boolean(content || children);
  const hasFooter = actions.length > 0 || Boolean(footerSlot);
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

  const handleMuiClose = (
    _event: object,
    reason: 'backdropClick' | 'escapeKeyDown',
  ) => {
    if (reason === 'backdropClick' && !canDismissOnBackdrop) {
      return;
    }
    if (reason === 'escapeKeyDown' && !canDismissOnEscape) {
      return;
    }
    onClose?.(reason);
  };

  const handleActionClick = (action: DialogActionItem) => {
    if (!action.disabled) {
      onActionClick?.(action);
    }
  };

  return (
    <Dialog
      ref={ref}
      id={id}
      data-testid={testId}
      data-size={size}
      open={open}
      onClose={handleMuiClose}
      disablePortal={disablePortal}
      container={container}
      fullScreen={isFullscreen}
      fullWidth={!isFullscreen}
      maxWidth={isFullscreen ? false : DIALOG_MAX_WIDTH_MAP[size]}
      scroll={scrollable ? 'paper' : 'body'}
      aria-labelledby={!ariaLabel && hasHeader ? titleId : undefined}
      aria-describedby={hasBody ? descriptionId : undefined}
      className={className}
      slotProps={{
        paper: {
          'aria-label': ariaLabel,
          'data-testid': testId ? `${testId}-paper` : undefined,
        } as Record<string, unknown>,
      }}
      sx={[
        {
          '& .MuiDialog-paper': {
            overflow: 'hidden',
          },
        },
        ...extraSx,
      ]}
    >
      {hasHeader ? (
        <DialogTitle
          id={titleId}
          component="div"
          data-testid={testId ? `${testId}-header` : undefined}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            px: 3,
            pt: 2.5,
            pb: hasBody ? 1.5 : 2,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {headerSlot ?? (
              <>
                {title ? (
                  <Typography
                    variant="h6"
                    component="h2"
                    data-testid={testId ? `${testId}-title` : undefined}
                    sx={{ fontWeight: 600, lineHeight: 1.3 }}
                  >
                    {title}
                  </Typography>
                ) : null}
                {subtitle ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    data-testid={testId ? `${testId}-subtitle` : undefined}
                    sx={{ mt: title ? 0.5 : 0 }}
                  >
                    {subtitle}
                  </Typography>
                ) : null}
              </>
            )}
          </Box>
          {renderCloseButton ? (
            <MagicButton
              kind="icon"
              variant="text"
              color="neutral"
              size="sm"
              leadingIcon="close"
              ariaLabel={closeButtonAriaLabel}
              testId={testId ? `${testId}-close` : undefined}
              onClick={() => onClose?.('closeButton')}
              sx={{ mt: -0.5, mr: -1 }}
            />
          ) : null}
        </DialogTitle>
      ) : null}

      {hasBody ? (
        <DialogContent
          id={descriptionId}
          dividers={scrollable}
          data-testid={testId ? `${testId}-content` : undefined}
          sx={{
            px: 3,
            py: scrollable ? 2 : 1.5,
            overflowY: scrollable ? 'auto' : 'visible',
          }}
        >
          {content ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ m: 0, mb: children ? 1.5 : 0 }}
            >
              {content}
            </Typography>
          ) : null}
          {children}
        </DialogContent>
      ) : null}

      {hasFooter ? (
        <DialogActions
          data-testid={testId ? `${testId}-actions` : undefined}
          sx={{
            px: 3,
            py: 2,
            gap: 1,
            justifyContent:
              alignActions === 'start' ? 'flex-start' : 'flex-end',
          }}
        >
          {actions.map((action, index) => (
            <MagicButton
              key={action.id ?? `${action.label}-${index}`}
              id={action.id}
              testId={
                testId
                  ? `${testId}-action-${action.id ?? index}`
                  : undefined
              }
              label={action.label}
              variant={action.variant ?? 'text'}
              color={action.color ?? 'primary'}
              leadingIcon={action.icon}
              disabled={action.disabled ?? false}
              onClick={() => handleActionClick(action)}
            />
          ))}
          {footerSlot}
        </DialogActions>
      ) : null}
    </Dialog>
  );
}
