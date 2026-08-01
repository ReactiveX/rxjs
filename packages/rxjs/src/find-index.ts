import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const findIndex: unique symbol = Symbol('findIndex');

declare global {
  interface Observable<T> {
    [findIndex]: {
      <A>(predicate: (this: A, value: T, index: number, source: Observable<T>) => boolean, thisArg: A): Observable<number>;
      (predicate: (value: T, index: number, source: Observable<T>) => boolean): Observable<number>;
    };
  }
}

function findIndexOperator<T, A>(
  this: Observable<T>,
  predicate: (this: A, value: T, index: number, source: Observable<T>) => boolean,
  thisArg: A
): Observable<number>;
function findIndexOperator<T>(
  this: Observable<T>,
  predicate: (value: T, index: number, source: Observable<T>) => boolean
): Observable<number>;
function findIndexOperator<T>(
  this: Observable<T>,
  predicate: (this: unknown, value: T, index: number, source: Observable<T>) => boolean,
  thisArg?: unknown
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
          if (predicate.call(thisArg, value, currentIndex, source)) {
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
