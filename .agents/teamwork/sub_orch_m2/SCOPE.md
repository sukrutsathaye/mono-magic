# Milestone M2 Scope (Feature F13 — Exclusive Write Ownership)

## Owned Files
1. `libs/ui/atomic-design-interfaces/`:
   - `src/lib/molecules/dialog.interface.ts` (`DialogSize = 'sm' | 'md' | 'lg' | 'fullscreen'`, `DIALOG_SIZES`, `DialogActionItem`, `DialogMoleculeProps`, optional `MagicDialogProps` alias)
   - `src/lib/molecules/alert.interface.ts` (`AlertSeverity = 'info' | 'success' | 'warning' | 'error'`, `ALERT_SEVERITIES`, `AlertVariant = 'standard' | 'filled' | 'outlined'`, `ALERT_VARIANTS`, `AlertMoleculeProps`, optional `MagicAlertProps` alias)
   - `src/lib/molecules/toast.interface.ts` (`ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'`, `TOAST_POSITIONS`, `ToastMoleculeProps`, optional `MagicToastProps` alias)
   - `src/lib/molecules/tabs.interface.ts` (`TabsOrientation = 'horizontal' | 'vertical'`, `TABS_ORIENTATIONS`, `TabsVariant = 'primary' | 'secondary'`, `TABS_VARIANTS`, `TabItem`, `TabsMoleculeProps`, optional `MagicTabsProps` alias)
   - `src/lib/molecules/accordion.interface.ts` (`AccordionAppearance = 'outlined' | 'raised'`, `ACCORDION_APPEARANCES`, `AccordionItem`, `AccordionMoleculeProps`, optional `MagicAccordionProps` alias)
   - `src/lib/molecules/avatar.interface.ts` (`AvatarStatus = 'online' | 'busy' | 'offline'`, `AVATAR_STATUSES`, `AvatarShape = 'circle' | 'rounded' | 'square'`, `AVATAR_SHAPES`, `AvatarGroupSpacing = 'tight' | 'normal'`, `AVATAR_GROUP_SPACINGS`, `AvatarMoleculeProps`, `AvatarGroupItem`, `AvatarGroupMoleculeProps`, optional `MagicAvatarProps`/`MagicAvatarGroupProps` aliases)
   - `src/lib/molecules/index.ts` (export all using `.js` ESM extensions)
   - `src/index.ts` (verify molecules export)
   - `src/lib/interfaces.spec.ts` (contract/type tests for all new types & constants)
2. `libs/ui/fl-mat/` (Contracts & Icons ONLY — no widget implementations):
   - `lib/src/interfaces/atomic_interfaces.dart` (mirror all Wave 2 molecule enums, item classes, prop/model classes with Dartdoc)
   - `lib/src/core/magic_icon.dart` (`magicIconMap` compile-time constant Material Icons needed by the 5 molecules: `info`, `check_circle`, `warning`, `error`, `close`, `expand_more`, `expand_less`, `person`, etc.)
3. `libs/ui/react-mui/src/lib/theme/mui-theme.tsx` ONLY:
   - Module augmentations & theme component overrides so `MagicAlert`, `MagicToast`, `MagicTabs`, `MagicDialog`, `MagicAccordion`, `MagicAvatar` work seamlessly with `ColorIntent` (`tertiary`, `neutral`, etc.) and M3 palettes.
