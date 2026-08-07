import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const sampleTime: unique symbol = Symbol('sampleTime');

declare global {
  interface Observable<T> {
    [sampleTime]: (period: number) => Observable<T>;
  }
}

Observable.prototype[sampleTime] = function <T>(this: Observable<T>, period: number): Observable<T> {
  return this[create]((subscriber) => {
    let hasValue = false;
    let latestValue: T;

    subscribeToSource(this, subscriber, {
      next: (value) => {
        hasValue = true;
        latestValue = value;
      },
    });

    if (!subscriber.active) {
      return;
    }

    const id = globalThis.setInterval(() => {
      if (hasValue) {
        hasValue = false;
        subscriber.next(latestValue);
      }
    }, period);
    subscriber.addTeardown(() => globalThis.clearInterval(id));
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `sampleTime` form of the exact-Symbol `[sampleTime]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[sampleTime]` to its source.
 */
export function pipeableSampleTime<T>(period: number): (source: Observable<T>) => Observable<T>;
export function pipeableSampleTime(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[sampleTime] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
