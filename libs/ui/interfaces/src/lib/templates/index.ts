import type { BaseTemplateProps } from '../common/atomic.interface.js';

export type { BaseTemplateProps };

/**
 * Extension point for Template-level layout contracts (e.g., PageLayout, DashboardLayout, AuthLayout).
 */
export interface PageLayoutTemplateProps extends BaseTemplateProps {
  title?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
