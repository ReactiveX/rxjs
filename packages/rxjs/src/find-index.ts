import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const findIndex: unique symbol = Symbol('findIndex');

declare global {
  interface Observable<T> {
    [findIndex]: {
      (predicate: (value: T, index: number, source: Observable<T>) => boolean): Observable<number>;
    };
  }
}

function findIndexOperator<T>(
  this: Observable<T>,
  predicate: (value: T, index: number, source: Observable<T>) => boolean
): Observable<number> {
  const source = this;

  return source[create]((subscriber) => {
    let index = 0;
    const sourceController = new AbortController();

    const conclude = (result: number): void => {
      sourceController.abort();
      subscriber.next(result);
      subscriber.complete();
    };

    subscribeToSource(
      source,
      subscriber,
      {
        next: (value) => {
          const currentIndex = index++;
          if (predicate(value, currentIndex, source)) {
            conclude(currentIndex);
          }
        },
        error: (error) => {
          sourceController.abort();
          subscriber.error(error);
        },
        complete: () => conclude(-1),
      },
      sourceController.signal
    );
  });
}

Observable.prototype[findIndex] = findIndexOperator;

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `findIndex` form of the exact-Symbol `[findIndex]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[findIndex]` to its source.
 */
export function pipeableFindIndex<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean): (source: Observable<T>) => Observable<number>;
export function pipeableFindIndex(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[findIndex] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
