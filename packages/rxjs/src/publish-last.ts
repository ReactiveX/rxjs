import { AsyncSubject } from './async-subject.js';
import type { ConnectableObservable } from './connectable.js';
import { multicast } from './multicast.js';

export const publishLast: unique symbol = Symbol('publishLast');

declare global {
  interface Observable<T> {
    [publishLast](): ConnectableObservable<T>;
  }
}

Observable.prototype[publishLast] = function <T>(this: Observable<T>): ConnectableObservable<T> {
  // RxJS 7 retains one AsyncSubject for the lifetime of the manually
  // connectable result, including after completion or error.
  return this[multicast](new AsyncSubject<T>());
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `publishLast` form of the exact-Symbol `[publishLast]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. Any non-Observable result is returned unchanged.
 *
 * @returns A unary function that applies `[publishLast]` to its source.
 */
export function pipeablePublishLast<T>(): (source: Observable<T>) => ConnectableObservable<T>;
export function pipeablePublishLast(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[publishLast] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
