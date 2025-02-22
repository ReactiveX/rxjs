// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
import { create } from './create.js';

export const mergeMap: unique symbol = Symbol('mergeMap');

declare global {
  interface Observable<T> {
    mergeMap: <R>(
      mapper: (value: T, index: number) => ObservableValue<R>,
      options?: { concurrent?: number }
    ) => Observable<R>;
  }
}

Observable.prototype[mergeMap] = function <T, R>(
  this: Observable<T>,
  mapper: (value: T, index: number) => ObservableValue<R>,
  options?: { concurrent?: number }
): Observable<R> {
  const { concurrent = Infinity } = options ?? {};

  if (concurrent === 1) {
    return this.flatMap(mapper);
  }

  return this[create]((subscriber) => {
    let index = 0;
    const buffer: T[] = [];
    let active = 0;
    let outerComplete = false;

    const innerSub = (value: T) => {
      let result: Observable<R>;
      try {
        result = Observable.from(mapper(value, index++));
      } catch (error) {
        subscriber.error(error);
        return;
      }

      active++;

      result.subscribe(
        {
          next: (innerValue) => subscriber.next(innerValue),
          error: (error) => subscriber.error(error),
          complete: () => {
            active--;
            if (buffer.length > 0) {
              innerSub(buffer.shift()!);
              return;
            }
            if (outerComplete && active === 0) {
              subscriber.complete();
            }
          },
        },
        {
          signal: subscriber.signal,
        }
      );
    };

    this.subscribe(
      {
        next: (value) => {
          if (active < concurrent) {
            innerSub(value);
          } else {
            buffer.push(value);
          }
        },
        error: (error) => subscriber.error(error),
        complete: () => {
          outerComplete = true;
          if (active === 0 && buffer.length === 0) {
            subscriber.complete();
          }
        },
      },
      { signal: subscriber.signal }
    );
  });
};
