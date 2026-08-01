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
