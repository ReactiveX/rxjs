import { create } from './create.js';
import { EmptyError } from './empty-error.js';

export const throwIfEmpty: unique symbol = Symbol('throwIfEmpty');

declare global {
  interface Observable<T> {
    [throwIfEmpty](errorFactory?: () => unknown): Observable<T>;
  }
}

Observable.prototype[throwIfEmpty] = function <T>(
  this: Observable<T>,
  errorFactory: () => unknown = () => new EmptyError()
): Observable<T> {
  return this[create]((subscriber) => {
    let hasValue = false;

    this.subscribe(
      {
        next: (value) => {
          hasValue = true;
          subscriber.next(value);
        },
        error: (error) => subscriber.error(error),
        complete: () => {
          if (hasValue) {
            subscriber.complete();
            return;
          }

          let error: unknown;
          try {
            error = errorFactory();
          } catch (factoryError) {
            subscriber.error(factoryError);
            return;
          }
          subscriber.error(error);
        },
      },
      { signal: subscriber.signal }
    );
  });
};
