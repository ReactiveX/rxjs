import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const scan: unique symbol = Symbol('scan');

declare global {
  interface Observable<T> {
    [scan]<A = T>(accumulator: (accumulator: A | T, value: T, index: number) => A): Observable<T | A>;
    [scan]<A>(accumulator: (accumulator: A, value: T, index: number) => A, seed: A): Observable<A>;
    [scan]<A, S>(accumulator: (accumulator: A | S, value: T, index: number) => A, seed: S): Observable<A>;
  }
}

function scanOperator<T, A = T>(this: Observable<T>, accumulator: (accumulator: A | T, value: T, index: number) => A): Observable<T | A>;
function scanOperator<T, A>(this: Observable<T>, accumulator: (accumulator: A, value: T, index: number) => A, seed: A): Observable<A>;
function scanOperator<T, A, S>(
  this: Observable<T>,
  accumulator: (accumulator: A | S, value: T, index: number) => A,
  seed: S
): Observable<A>;
function scanOperator<T, A, S>(
  this: Observable<T>,
  accumulator: (accumulator: T | A | S, value: T, index: number) => A,
  ...seed: [] | [S]
): Observable<T | A> {
  return this[create]((subscriber) => {
    let state: { initialized: false } | { initialized: true; value: T | A | S } =
      seed.length === 0 ? { initialized: false } : { initialized: true, value: seed[0] };
    let index = 0;

    subscribeToSource(this, subscriber, {
      next: (value) => {
        const currentIndex = index++;
        if (!state.initialized) {
          state = {
            initialized: true,
            value,
          };
          subscriber.next(value);
          return;
        }

        const nextState = accumulator(state.value, value, currentIndex);
        state = {
          initialized: true,
          value: nextState,
        };
        subscriber.next(nextState);
      },
    });
  });
}

Observable.prototype[scan] = scanOperator;
