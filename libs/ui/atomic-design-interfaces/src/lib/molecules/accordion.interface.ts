import type {
  AtomicSize,
  BaseMoleculeProps,
} from '../common/atomic.interface.js';

/** Visual surface treatment for `MagicAccordion` panels. */
export type AccordionAppearance = 'outlined' | 'raised';

/** Ordered list of supported accordion surface appearances. */
export const ACCORDION_APPEARANCES: readonly AccordionAppearance[] = [
  'outlined',
  'raised',
] as const;

/** Panel descriptor rendered inside `MagicAccordion`. */
export interface AccordionItem {
  /** Unique identifier for the accordion panel. */
  id: string;
  /** Primary heading displayed in the clickable summary header. */
  title: string;
  /** Optional secondary summary text displayed next to `title`. */
  summary?: string;
  /** Body content revealed when the panel is expanded. */
  content?: string;
  /** Optional Material icon string name displayed in the panel header. */
  icon?: string;
  /** Whether this individual panel is disabled and non-expandable. */
  disabled?: boolean;
  /** Initial per-item expanded hint when `expandedIds` is not supplied. */
  expanded?: boolean;
}

/** Shared property contract for `MagicAccordion` across all UI libraries. */
export interface AccordionMoleculeProps extends BaseMoleculeProps {
  /** Ordered list of collapsible accordion panel items. */
  items: readonly AccordionItem[];
  /** Whether multiple panels may be expanded simultaneously. */
  multiple?: boolean;
  /** Controlled list of currently expanded panel identifiers. */
  expandedIds?: readonly string[];
  /** Initial list of expanded panel identifiers for uncontrolled usage. */
  defaultExpandedIds?: readonly string[];
  /** Material 3 surface appearance (`outlined` or `raised`). */
  appearance?: AccordionAppearance;
  /** Standardized component density/size preset. */
  size?: AtomicSize;
}

/** Alias for {@link AccordionMoleculeProps} aligned with `MagicAccordion` component naming. */
export type MagicAccordionProps = AccordionMoleculeProps;
