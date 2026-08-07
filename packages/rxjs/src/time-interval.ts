import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const timeInterval: unique symbol = Symbol('timeInterval');

export interface TimeIntervalProvider {
  now(): number;
}

export class TimeInterval<T> {
  constructor(public value: T, public interval: number) {}
}

declare global {
  interface Observable<T> {
    [timeInterval]: (timestampProvider?: TimeIntervalProvider) => Observable<TimeInterval<T>>;
  }
}

Observable.prototype[timeInterval] = function <T>(
  this: Observable<T>,
  timestampProvider?: TimeIntervalProvider
): Observable<TimeInterval<T>> {
  return this[create]((subscriber) => {
    let lastTimestamp: number;
    try {
      lastTimestamp = timestampProvider === undefined ? globalThis.Date.now() : timestampProvider.now();
    } catch (error) {
      subscriber.error(error);
      return;
    }

    subscribeToSource(this, subscriber, {
      next: (value) => {
        const currentTimestamp = timestampProvider === undefined ? globalThis.Date.now() : timestampProvider.now();
        const interval = currentTimestamp - lastTimestamp;
        lastTimestamp = currentTimestamp;
        subscriber.next(new TimeInterval(value, interval));
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `timeInterval` form of the exact-Symbol `[timeInterval]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[timeInterval]` to its source.
 */
export function pipeableTimeInterval<T>(timestampProvider?: TimeIntervalProvider): (source: Observable<T>) => Observable<TimeInterval<T>>;
export function pipeableTimeInterval(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[timeInterval] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
