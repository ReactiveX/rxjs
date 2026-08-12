import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const exhaustMap: unique symbol = Symbol('exhaustMap');

declare global {
  interface Observable<T> {
    [exhaustMap]: <R>(
      mapper: (value: T, index: number) => ObservableValue<R>,
      options?: {
        concurrent?: number;
      }
    ) => Observable<R>;
  }
}

Observable.prototype[exhaustMap] = function <T, R>(
  this: Observable<T>,
  mapper: (value: T, index: number) => ObservableValue<R>,
  options?: { concurrent?: number }
): Observable<R> {
  return this[create]((subscriber) => {
    const { concurrent = 1 } = options ?? {};
    let outerComplete = false;
    let index = 0;
    let active = 0;

    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (active < concurrent) {
          const source = Observable.from(mapper(value, index++));
          active++;
          subscribeToSource(source, subscriber, {
            complete: () => {
              active--;
              if (outerComplete && active === 0) {
                subscriber.complete();
              }
            },
          });
        }
      },
      complete: () => {
        outerComplete = true;
        if (active === 0) {
          subscriber.complete();
        }
      },
    });
  });
};
