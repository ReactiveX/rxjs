import { CompleteNotification, NextNotification, ErrorNotification } from './types';

/**
 * A completion object optimized for memory use and created to be the
 * same "shape" as other notifications in v8.
 * @internal
 */
export const COMPLETE_NOTIFICATION = (() => createNotification('C', undefined, undefined) as CompleteNotification)();

/**
 * Internal use only. Creates an optimized error notification that is the same "shape"
 * as other notifications.
 * @internal
 */
export function errorNotification(error: any): ErrorNotification {
  return createNotification('E', undefined, error) as any;
}

/**
 * Internal use only. Creates an optimized next notification that is the same "shape"
 * as other notifications.
 * @internal
 */
export function nextNotification<T>(value: T) {
  return createNotification('N', value, undefined) as NextNotification<T>;
}

export function createNotification<T>(kind: 'N', value: T, error: undefined): { kind: 'N'; value: T; error: undefined };
export function createNotification<T>(kind: 'E', value: undefined, error: any): { kind: 'E'; value: undefined; error: any };
export function createNotification<T>(kind: 'C', value: undefined, error: undefined): { kind: 'C'; value: undefined; error: undefined };
export function createNotification<T>(
  kind: 'N' | 'E' | 'C',
  value: T | undefined,
  error: any
): { kind: 'N' | 'E' | 'C'; value: T | undefined; error: any };

/**
 * Ensures that all notifications created internally have the same "shape" in v8.
 *
 * TODO: This is only exported to support a crazy legacy test in `groupBy`.
 * @internal
 */
export function createNotification<T>(kind: 'N' | 'E' | 'C', value: T | undefined, error: any) {
  return {
    kind,
    value,
    error,
  };
}
