import { CompleteNotification, NextNotification, ErrorNotification } from './types';

/**
 * A completion object optimized for memory use and created to be the
 * same "shape" as other notifications in v8.
 * @internal
 */
export const COMPLETE_NOTIFICATION: CompleteNotification = { kind: 'C' };

/**
 * Internal use only. Creates an optimized error notification that is the same "shape"
 * as other notifications.
 * @internal
 */
export function errorNotification(error: unknown): ErrorNotification {
  return { kind: 'E', error };
}

/**
 * Internal use only. Creates an optimized next notification that is the same "shape"
 * as other notifications.
 * @internal
 */
export function nextNotification<T>(value: T): NextNotification<T> {
  return { kind: 'N', value };
}
