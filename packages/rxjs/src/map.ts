import { create } from './create.js';

export const map: unique symbol = Symbol('map');

declare global {
  interface Observable<T> {
    [map]: {
      <R>(project: (value: T, index: number) => R): Observable<R>;
      <R, A>(project: (this: A, value: T, index: number) => R, thisArg: A): Observable<R>;
    };
  }
}

function mapOperator<T, R>(this: Observable<T>, project: (value: T, index: number) => R): Observable<R>;
function mapOperator<T, R, A>(this: Observable<T>, project: (this: A, value: T, index: number) => R, thisArg: A): Observable<R>;
function mapOperator<T, R, A>(
  this: Observable<T>,
  project: (this: A | undefined, value: T, index: number) => R,
  thisArg?: A
): Observable<R> {
  return this[create]((subscriber) => {
    let index = 0;

    this.subscribe(
      {
        next: (value) => {
          let result: R;
          try {
            result = project.call(thisArg, value, index++);
          } catch (error) {
            subscriber.error(error);
            return;
          }
          subscriber.next(result);
        },
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete(),
      },
      { signal: subscriber.signal }
    );
  });
}

Observable.prototype[map] = mapOperator;
