// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
import { create } from './create.js';

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

    this.subscribe(
      {
        next: (value) => {
          if (active < concurrent) {
            let source: Observable<R>;
            try {
              source = Observable.from(mapper(value, index++));
            } catch (error) {
              subscriber.error(error);
              return;
            }
            source.subscribe({
              next: (value) => subscriber.next(value),
              error: (error) => subscriber.error(error),
              complete: () => {
                active--;
                if (outerComplete && active === 0) {
                  subscriber.complete();
                }
              },
            });
          }
        },
        error: (error) => subscriber.error(error),
        complete: () => {
          outerComplete = true;
          if (active === 0) {
            subscriber.complete();
          }
        },
      },
      { signal: subscriber.signal }
    );
  });
};
