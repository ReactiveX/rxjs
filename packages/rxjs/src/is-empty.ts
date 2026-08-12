import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const isEmpty: unique symbol = Symbol('isEmpty');

declare global {
  interface Observable<T> {
    [isEmpty](): Observable<boolean>;
  }
}

function isEmptyOperator<T>(this: Observable<T>): Observable<boolean> {
  const source = this;

  return source[create]((subscriber) => {
    const sourceController = new AbortController();

    const conclude = (result: boolean): void => {
      sourceController.abort();
      subscriber.next(result);
      subscriber.complete();
    };

    subscribeToSource(
      source,
      subscriber,
      {
        next: () => conclude(false),
        error: (error) => {
          sourceController.abort();
          subscriber.error(error);
        },
        complete: () => conclude(true),
      },
      sourceController.signal
    );
  });
}

Observable.prototype[isEmpty] = isEmptyOperator;
