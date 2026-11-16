export type AtomicTier = 'atom' | 'molecule' | 'organism' | 'template';

export const ATOMIC_TIERS: readonly AtomicTier[] = [
  'atom',
  'molecule',
  'organism',
  'template',
] as const;

export type AtomicSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ColorIntent =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral';

export interface BaseAtomicProps {
  id?: string;
  testId?: string;
  ariaLabel?: string;
}

export interface BaseAtomProps extends BaseAtomicProps {
  disabled?: boolean;
}

export type BaseMoleculeProps = BaseAtomicProps;
export type BaseOrganismProps = BaseAtomicProps;
export type BaseTemplateProps = BaseAtomicProps;
