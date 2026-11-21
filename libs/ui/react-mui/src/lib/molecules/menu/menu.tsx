import { useState, type MouseEvent, type ReactNode, type Ref } from 'react';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import type { PopoverOrigin } from '@mui/material/Popover';
import type { SxProps, Theme } from '@mui/material/styles';
import type {
  ButtonVariant,
  MenuCloseReason,
  MenuItem,
  MenuMoleculeProps,
  MenuPositionX,
  MenuPositionY,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButton } from '../../atoms/button/button';
import { MagicIcon } from '../../core/icon';

/**
 * Props for {@link MagicMenu}, extending {@link MenuMoleculeProps}
 * with React 19 / MUI v9 trigger and menu panel ergonomics.
 */
export interface MagicMenuProps extends MenuMoleculeProps {
  /** Visual variant applied to the default `'button'` trigger. Defaults to `'tonal'`. */
  triggerVariant?: ButtonVariant;
  /** Optional custom trigger React node rendered in place of the default `MagicButton`. */
  customTrigger?: ReactNode;
  /** Optional CSS class applied to the menu overlay Paper panel via `slotProps.paper`. */
  panelClass?: string;
  /** Optional CSS class applied to the overlay backdrop via `slotProps.backdrop`. */
  backdropClass?: string;
  /** Invoked when a leaf menu item (without `children`) is selected. */
  onItemSelect?: (item: MenuItem) => void;
  /** Invoked when the root menu panel opens. */
  onMenuOpen?: () => void;
  /** Invoked when the root menu panel closes with the close reason. */
  onMenuClose?: (reason: MenuCloseReason) => void;
  /** Optional MUI `sx` overrides applied to the outer trigger wrapper. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name applied to the outer trigger wrapper. */
  className?: string;
  /** React 19 ref forwarded directly to the outer trigger wrapper `<div>` element. */
  ref?: Ref<HTMLDivElement>;
}

interface ResolvedMenuOrigins {
  anchorOrigin: PopoverOrigin;
  transformOrigin: PopoverOrigin;
}

function resolveMenuOrigins(
  xPosition: MenuPositionX,
  yPosition: MenuPositionY,
  overlapTrigger: boolean,
): ResolvedMenuOrigins {
  const horizontal: 'left' | 'right' =
    xPosition === 'before' ? 'right' : 'left';
  if (overlapTrigger) {
    const vertical: 'top' | 'bottom' = yPosition === 'above' ? 'bottom' : 'top';
    return {
      anchorOrigin: { vertical, horizontal },
      transformOrigin: { vertical, horizontal },
    };
  }
  return {
    anchorOrigin: {
      vertical: yPosition === 'above' ? 'top' : 'bottom',
      horizontal,
    },
    transformOrigin: {
      vertical: yPosition === 'above' ? 'bottom' : 'top',
      horizontal,
    },
  };
}

interface MagicSubmenuBranchProps {
  item: MenuItem;
  index: number;
  parentKey: string;
  testId?: string;
  xPosition: MenuPositionX;
  yPosition: MenuPositionY;
  hasBackdrop: boolean;
  panelClass?: string;
  backdropClass?: string;
  onLeafSelect: (item: MenuItem) => void;
}

function MagicSubmenuBranch({
  item,
  index,
  parentKey,
  testId,
  xPosition,
  yPosition,
  hasBackdrop,
  panelClass,
  backdropClass,
  onLeafSelect,
}: MagicSubmenuBranchProps) {
  const [subAnchorEl, setSubAnchorEl] = useState<HTMLElement | null>(null);
  const subOpen = Boolean(subAnchorEl);
  const itemKey = `${parentKey}-${item.id ?? index}`;
  const itemTestId = testId
    ? `${testId}-item-${item.id ?? itemKey}`
    : undefined;

  const handleOpenSubmenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (!item.disabled) {
      setSubAnchorEl(event.currentTarget);
    }
  };

  const handleCloseSubmenu = () => {
    setSubAnchorEl(null);
  };

  const handleLeafSelect = (leafItem: MenuItem) => {
    setSubAnchorEl(null);
    onLeafSelect(leafItem);
  };

  const subHorizontal: 'left' | 'right' =
    xPosition === 'before' ? 'left' : 'right';
  const subTransformHorizontal: 'left' | 'right' =
    xPosition === 'before' ? 'right' : 'left';

  return (
    <>
      <MuiMenuItem
        id={item.id}
        data-testid={itemTestId}
        role={item.role ?? 'menuitem'}
        disabled={item.disabled ?? false}
        disableRipple={item.disableRipple ?? false}
        aria-haspopup="menu"
        aria-expanded={subOpen ? 'true' : 'false'}
        onClick={handleOpenSubmenu}
      >
        {item.icon ? (
          <ListItemIcon>
            <MagicIcon icon={item.icon} size="sm" />
          </ListItemIcon>
        ) : null}
        <ListItemText primary={item.label} />
        <MagicIcon icon="chevron_right" size="sm" sx={{ ml: 1.5 }} />
      </MuiMenuItem>

      <Menu
        anchorEl={subAnchorEl}
        open={subOpen}
        onClose={handleCloseSubmenu}
        anchorOrigin={{
          vertical: yPosition === 'above' ? 'bottom' : 'top',
          horizontal: subHorizontal,
        }}
        transformOrigin={{
          vertical: yPosition === 'above' ? 'bottom' : 'top',
          horizontal: subTransformHorizontal,
        }}
        slotProps={{
          paper: {
            className: panelClass,
            sx: { minWidth: 180, borderRadius: 2 },
          },
          backdrop: {
            invisible: !hasBackdrop,
            className: backdropClass,
          },
          list: {
            'aria-label': item.label,
          },
        }}
      >
        {item.children?.map((child, childIndex) =>
          child.children && child.children.length > 0 ? (
            <MagicSubmenuBranch
              key={`${itemKey}-${child.id ?? childIndex}`}
              item={child}
              index={childIndex}
              parentKey={itemKey}
              testId={testId}
              xPosition={xPosition}
              yPosition={yPosition}
              hasBackdrop={hasBackdrop}
              panelClass={panelClass}
              backdropClass={backdropClass}
              onLeafSelect={handleLeafSelect}
            />
          ) : (
            <MagicMenuLeafItem
              key={`${itemKey}-${child.id ?? childIndex}`}
              item={child}
              itemKey={`${itemKey}-${child.id ?? childIndex}`}
              testId={testId}
              onSelect={handleLeafSelect}
            />
          ),
        )}
      </Menu>
    </>
  );
}

interface MagicMenuLeafItemProps {
  item: MenuItem;
  itemKey: string;
  testId?: string;
  onSelect: (item: MenuItem) => void;
}

function MagicMenuLeafItem({
  item,
  itemKey,
  testId,
  onSelect,
}: MagicMenuLeafItemProps) {
  const itemTestId = testId
    ? `${testId}-item-${item.id ?? itemKey}`
    : undefined;

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    onSelect(item);
  };

  if (item.link) {
    return (
      <MuiMenuItem
        component="a"
        href={item.disabled ? undefined : item.link}
        id={item.id}
        data-testid={itemTestId}
        role={item.role ?? 'menuitem'}
        disabled={item.disabled ?? false}
        disableRipple={item.disableRipple ?? false}
        onClick={handleClick}
      >
        {item.icon ? (
          <ListItemIcon>
            <MagicIcon icon={item.icon} size="sm" />
          </ListItemIcon>
        ) : null}
        <ListItemText primary={item.label} />
      </MuiMenuItem>
    );
  }

  return (
    <MuiMenuItem
      id={item.id}
      data-testid={itemTestId}
      role={item.role ?? 'menuitem'}
      disabled={item.disabled ?? false}
      disableRipple={item.disableRipple ?? false}
      onClick={handleClick}
    >
      {item.icon ? (
        <ListItemIcon>
          <MagicIcon icon={item.icon} size="sm" />
        </ListItemIcon>
      ) : null}
      <ListItemText primary={item.label} />
    </MuiMenuItem>
  );
}

/**
 * Dropdown action menu molecule composing {@link MagicButton} and MUI v9 `Menu`
 * with recursive nested submenu support (`item.children`).
 *
 * Supports `'button'` and `'icon'` triggers, configurable `xPosition` (`'before'` / `'after'`),
 * `yPosition` (`'above'` / `'below'`), `overlapTrigger`, `hasBackdrop`, link items,
 * and semantic item roles (`'menuitem'`, `'menuitemradio'`, `'menuitemcheckbox'`).
 */
export function MagicMenu({
  id,
  testId,
  ariaLabel,
  items,
  triggerLabel = 'Menu',
  triggerIcon = 'more_vert',
  triggerType = 'button',
  triggerVariant = 'tonal',
  customTrigger,
  xPosition = 'after',
  yPosition = 'below',
  overlapTrigger = false,
  hasBackdrop = true,
  panelClass,
  backdropClass,
  disabled = false,
  size = 'md',
  color = 'primary',
  onItemSelect,
  onMenuOpen,
  onMenuClose,
  sx,
  className,
  ref,
}: MagicMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const { anchorOrigin, transformOrigin } = resolveMenuOrigins(
    xPosition,
    yPosition,
    overlapTrigger,
  );

  const handleTriggerClick = (event: MouseEvent<HTMLElement>) => {
    if (disabled) {
      return;
    }
    setAnchorEl(event.currentTarget);
    onMenuOpen?.();
  };

  const handleClose = (
    _event: object,
    reason: 'backdropClick' | 'escapeKeyDown' | 'tabKeyDown',
  ) => {
    setAnchorEl(null);
    const mappedReason: MenuCloseReason =
      reason === 'escapeKeyDown'
        ? 'keydown'
        : reason === 'tabKeyDown'
          ? 'tab'
          : 'click';
    onMenuClose?.(mappedReason);
  };

  const handleLeafSelect = (item: MenuItem) => {
    setAnchorEl(null);
    onItemSelect?.(item);
    onMenuClose?.('click');
  };

  const resolvedButtonIcon =
    triggerType === 'icon'
      ? triggerIcon || 'more_vert'
      : triggerIcon && triggerIcon !== 'more_vert'
        ? triggerIcon
        : undefined;

  return (
    <Box
      ref={ref}
      data-testid={testId}
      className={className}
      sx={[{ display: 'inline-flex' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    >
      {customTrigger ? (
        <Box
          component="span"
          data-testid={testId ? `${testId}-custom-trigger` : undefined}
          onClick={handleTriggerClick}
          sx={{
            display: 'inline-flex',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {customTrigger}
        </Box>
      ) : (
        <MagicButton
          id={id}
          testId={testId ? `${testId}-button` : undefined}
          kind={triggerType === 'icon' ? 'icon' : 'default'}
          variant={triggerVariant}
          label={triggerType === 'icon' ? undefined : triggerLabel}
          leadingIcon={resolvedButtonIcon}
          ariaLabel={ariaLabel ?? triggerLabel}
          color={color}
          size={size}
          disabled={disabled}
          slotProps={{
            root: {
              'aria-haspopup': 'menu',
              'aria-expanded': open ? 'true' : 'false',
            },
          }}
          onClick={handleTriggerClick}
        />
      )}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        slotProps={{
          paper: {
            className: panelClass,
            sx: { minWidth: 180, borderRadius: 2 },
          },
          backdrop: {
            invisible: !hasBackdrop,
            className: backdropClass,
          },
          list: {
            'aria-label': ariaLabel ?? triggerLabel,
          },
        }}
      >
        {items.map((item, index) =>
          item.children && item.children.length > 0 ? (
            <MagicSubmenuBranch
              key={item.id ?? `${item.label}-${index}`}
              item={item}
              index={index}
              parentKey="root"
              testId={testId}
              xPosition={xPosition}
              yPosition={yPosition}
              hasBackdrop={hasBackdrop}
              panelClass={panelClass}
              backdropClass={backdropClass}
              onLeafSelect={handleLeafSelect}
            />
          ) : (
            <MagicMenuLeafItem
              key={item.id ?? `${item.label}-${index}`}
              item={item}
              itemKey={`${item.id ?? index}`}
              testId={testId}
              onSelect={handleLeafSelect}
            />
          ),
        )}
      </Menu>
    </Box>
  );
}
