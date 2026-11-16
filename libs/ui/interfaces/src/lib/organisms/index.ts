import type { BaseOrganismProps } from '../common/atomic.interface.js';

export type { BaseOrganismProps };

/**
 * Extension point for Organism-level UI contracts (e.g., Card, Navbar, Modal, DataTable).
 */
export interface CardOrganismProps extends BaseOrganismProps {
  title: string;
  subtitle?: string;
  elevated?: boolean;
}
