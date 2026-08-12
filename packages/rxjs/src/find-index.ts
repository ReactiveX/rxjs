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
