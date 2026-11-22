import type {
  AtomicSize,
  BaseMoleculeProps,
  ColorIntent,
} from '../common/atomic.interface.js';

/** Layout axis orientation for `MagicTabs`. */
export type TabsOrientation = 'horizontal' | 'vertical';

/** Ordered list of supported tab strip orientations. */
export const TABS_ORIENTATIONS: readonly TabsOrientation[] = [
  'horizontal',
  'vertical',
] as const;

/** Material 3 tab indicator hierarchy variant for `MagicTabs`. */
export type TabsVariant = 'primary' | 'secondary';

/** Ordered list of supported tab hierarchy variants. */
export const TABS_VARIANTS: readonly TabsVariant[] = [
  'primary',
  'secondary',
] as const;

/** Tab descriptor rendered inside `MagicTabs`. */
export interface TabItem {
  /** Unique identifier for the tab and its corresponding panel. */
  id: string;
  /** Human-readable tab label. */
  label: string;
  /** Optional Material icon string name displayed alongside `label`. */
  icon?: string;
  /** Optional badge count or short status text shown on the tab. */
  badgeContent?: string | number;
  /** Whether this tab cannot be selected. */
  disabled?: boolean;
  /** Optional default text content rendered in the tab panel. */
  content?: string;
}

/** Shared property contract for `MagicTabs` across all UI libraries. */
export interface TabsMoleculeProps extends BaseMoleculeProps {
  /** Ordered list of tab descriptors and panel definitions. */
  items: readonly TabItem[];
  /** Controlled active tab identifier. */
  activeTabId?: string;
  /** Initial active tab identifier for uncontrolled usage. */
  defaultActiveTabId?: string;
  /** Tab strip layout axis (`horizontal` or `vertical`). */
  orientation?: TabsOrientation;
  /** Material 3 tab indicator variant (`primary` or `secondary`). */
  variant?: TabsVariant;
  /** Whether the tab header strip scrolls horizontally when items overflow. */
  scrollable?: boolean;
  /** Whether inactive tab panels defer mounting until first selected. */
  lazy?: boolean;
  /** Semantic color intent applied to active tab text and indicator. */
  color?: ColorIntent;
  /** Standardized component density/size preset. */
  size?: AtomicSize;
}

/** Alias for {@link TabsMoleculeProps} aligned with `MagicTabs` component naming. */
export type MagicTabsProps = TabsMoleculeProps;
