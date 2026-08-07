import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const mergeMap: unique symbol = Symbol('mergeMap');

declare global {
  interface Observable<T> {
    [mergeMap]: <R>(mapper: (value: T, index: number) => ObservableInput<R>, options?: { concurrent?: number }) => Observable<R>;
  }
}

Observable.prototype[mergeMap] = function <T, R>(
  this: Observable<T>,
  mapper: (value: T, index: number) => ObservableInput<R>,
  options?: { concurrent?: number }
): Observable<R> {
  const { concurrent = Infinity } = options ?? {};

  return this[create]((subscriber) => {
    let index = 0;
    const buffer: T[] = [];
    let active = 0;
    let outerComplete = false;

    const innerSub = (value: T) => {
      const result = Observable.from(mapper(value, index++));

      active++;

      subscribeToSource(result, subscriber, {
        complete: () => {
          active--;
          if (buffer.length > 0) {
            innerSub(buffer.shift()!);
            return;
          }
          if (outerComplete && active === 0) {
            subscriber.complete();
          }
        },
      });
    };

    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (active < concurrent) {
          innerSub(value);
        } else {
          buffer.push(value);
        }
      },
      complete: () => {
        outerComplete = true;
        if (active === 0 && buffer.length === 0) {
          subscriber.complete();
        }
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `mergeMap` form of the exact-Symbol `[mergeMap]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[mergeMap]` to its source.
 */
export function pipeableMergeMap<T, R>(mapper: (value: T, index: number) => ObservableInput<R>, options?: { concurrent?: number }): (source: Observable<T>) => Observable<R>;
export function pipeableMergeMap(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[mergeMap] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
