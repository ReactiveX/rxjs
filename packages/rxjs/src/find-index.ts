import { create } from './create.js';

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
    const signal = AbortSignal.any([subscriber.signal, sourceController.signal]);

    const conclude = (result: number): void => {
      sourceController.abort();
      subscriber.next(result);
      subscriber.complete();
    };

    source.subscribe(
      {
        next: (value) => {
          const currentIndex = index++;
          let matches: boolean;
          try {
            matches = predicate.call(thisArg, value, currentIndex, source);
          } catch (error) {
            sourceController.abort();
            subscriber.error(error);
            return;
          }

          if (matches) {
            conclude(currentIndex);
          }
        },
        error: (error) => {
          sourceController.abort();
          subscriber.error(error);
        },
        complete: () => conclude(-1),
      },
      { signal }
    );
  });
}

Observable.prototype[findIndex] = findIndexOperator;
