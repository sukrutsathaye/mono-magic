import type { Signal } from '@angular/core';

/**
 * Maps a framework-agnostic props interface (from
 * `@mono-magic/atomic-design-interfaces`) onto its signal-based Angular
 * equivalent, so a component can say
 * `implements SignalProps<ButtonAtomProps>`.
 *
 * Every prop must be exposed as a signal (`input()`, `model()`, `computed()`),
 * which keeps the Angular components honest against the shared contract.
 */
export type SignalProps<P> = {
  readonly [K in keyof P]-?: Signal<P[K] | undefined>;
};
