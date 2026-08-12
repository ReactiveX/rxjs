import { create } from './create.js';
import { EmptyError } from './empty-error.js';
import { subscribeToSource } from './util/observable-helpers.js';

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

    subscribeToSource(this, subscriber, {
      next: (value) => {
        hasValue = true;
        subscriber.next(value);
      },
      complete: () => {
        if (hasValue) {
          subscriber.complete();
          return;
        }

        subscriber.error(errorFactory());
      },
    });
  });
};
