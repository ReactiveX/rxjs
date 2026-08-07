import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const exhaustMap: unique symbol = Symbol('exhaustMap');

declare global {
  interface Observable<T> {
    [exhaustMap]: <R>(
      mapper: (value: T, index: number) => ObservableInput<R>,
      options?: {
        concurrent?: number;
      }
    ) => Observable<R>;
  }
}

Observable.prototype[exhaustMap] = function <T, R>(
  this: Observable<T>,
  mapper: (value: T, index: number) => ObservableInput<R>,
  options?: { concurrent?: number }
): Observable<R> {
  return this[create]((subscriber) => {
    const { concurrent = 1 } = options ?? {};
    let outerComplete = false;
    let index = 0;
    let active = 0;

    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (active < concurrent) {
          const source = Observable.from(mapper(value, index++));
          active++;
          subscribeToSource(source, subscriber, {
            complete: () => {
              active--;
              if (outerComplete && active === 0) {
                subscriber.complete();
              }
            },
          });
        }
      },
      complete: () => {
        outerComplete = true;
        if (active === 0) {
          subscriber.complete();
        }
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `exhaustMap` form of the exact-Symbol `[exhaustMap]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[exhaustMap]` to its source.
 */
export function pipeableExhaustMap<T, R>(mapper: (value: T, index: number) => ObservableInput<R>, options?: {
        concurrent?: number;
      }): (source: Observable<T>) => Observable<R>;
export function pipeableExhaustMap(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[exhaustMap] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
