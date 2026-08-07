import { create } from './create.js';
import { observeNotification, type ObservableNotification, type ValueFromNotification } from './notification.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const dematerialize: unique symbol = Symbol('dematerialize');

declare global {
  interface Observable<T> {
    [dematerialize](): Observable<ValueFromNotification<T>>;
  }
}

Observable.prototype[dematerialize] = function <N extends ObservableNotification<any>>(
  this: Observable<N>
): Observable<ValueFromNotification<N>> {
  return this[create]((subscriber) => {
    subscribeToSource(this, subscriber, { next: (notification) => observeNotification(notification, subscriber) });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `dematerialize` form of the exact-Symbol `[dematerialize]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[dematerialize]` to its source.
 */
export function pipeableDematerialize<T>(): (source: Observable<T>) => Observable<ValueFromNotification<T>>;
export function pipeableDematerialize(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[dematerialize] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
