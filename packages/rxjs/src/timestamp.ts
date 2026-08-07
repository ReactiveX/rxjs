import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const timestamp: unique symbol = Symbol('timestamp');

export interface TimestampProvider {
  now(): number;
}

export interface Timestamp<T> {
  value: T;
  timestamp: number;
}

declare global {
  interface Observable<T> {
    [timestamp]: (timestampProvider?: TimestampProvider) => Observable<Timestamp<T>>;
  }
}

Observable.prototype[timestamp] = function <T>(this: Observable<T>, timestampProvider?: TimestampProvider): Observable<Timestamp<T>> {
  return this[create]((subscriber) => {
    subscribeToSource(this, subscriber, {
      next: (value) => {
        const currentTimestamp = timestampProvider === undefined ? globalThis.Date.now() : timestampProvider.now();
        subscriber.next({ value, timestamp: currentTimestamp });
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `timestamp` form of the exact-Symbol `[timestamp]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[timestamp]` to its source.
 */
export function pipeableTimestamp<T>(timestampProvider?: TimestampProvider): (source: Observable<T>) => Observable<Timestamp<T>>;
export function pipeableTimestamp(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[timestamp] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
