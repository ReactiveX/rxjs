import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const reduce: unique symbol = Symbol('reduce');

declare global {
  interface Observable<T> {
    [reduce]: {
      <A = T>(accumulator: (accumulator: A | T, value: T, index: number) => A): Observable<T | A>;
      <A>(accumulator: (accumulator: A, value: T, index: number) => A, seed: A): Observable<A>;
      <A, S = A>(accumulator: (accumulator: A | S, value: T, index: number) => A, seed: S): Observable<A>;
    };
  }
}

function reduceOperator<T, A = T>(this: Observable<T>, accumulator: (accumulator: A | T, value: T, index: number) => A): Observable<T | A>;
function reduceOperator<T, A>(this: Observable<T>, accumulator: (accumulator: A, value: T, index: number) => A, seed: A): Observable<A>;
function reduceOperator<T, A, S = A>(
  this: Observable<T>,
  accumulator: (accumulator: A | S, value: T, index: number) => A,
  seed: S
): Observable<A>;
function reduceOperator<T, A>(
  this: Observable<T>,
  accumulator: (accumulator: A | T, value: T, index: number) => A,
  seed?: A
): Observable<T | A> {
  const source = this;
  const hasSeed = arguments.length >= 2;

  return source[create]((subscriber) => {
    let hasState = hasSeed;
    let state: A | T | undefined = seed;
    let index = 0;
    const sourceController = new AbortController();
    subscribeToSource(
      source,
      subscriber,
      {
        next: (value) => {
          const currentIndex = index++;
          if (!hasState) {
            hasState = true;
            state = value;
            return;
          }

          state = accumulator(state as A | T, value, currentIndex);
        },
        error: (error) => subscriber.error(error),
        complete: () => {
          if (hasState) {
            subscriber.next(state as A | T);
          }
          subscriber.complete();
        },
      },
      sourceController.signal
    );
  });
}

Observable.prototype[reduce] = reduceOperator;

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `reduce` form of the exact-Symbol `[reduce]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[reduce]` to its source.
 */
export function pipeableReduce<T, A = T>(accumulator: (accumulator: A | T, value: T, index: number) => A): (source: Observable<T>) => Observable<T | A>;
export function pipeableReduce<T, A>(accumulator: (accumulator: A, value: T, index: number) => A, seed: A): (source: Observable<T>) => Observable<A>;
export function pipeableReduce<T, A, S = A>(accumulator: (accumulator: A | S, value: T, index: number) => A, seed: S): (source: Observable<T>) => Observable<A>;
export function pipeableReduce(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[reduce] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
