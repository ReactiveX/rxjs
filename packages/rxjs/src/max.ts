import { reduce } from './reduce.js';

type Comparer<T> = (previous: T, current: T) => number;

export const max: unique symbol = Symbol('max');

declare global {
  interface Observable<T> {
    [max]: (comparer?: Comparer<T>) => Observable<T>;
  }
}

Observable.prototype[max] = function <T>(this: Observable<T>, comparer?: Comparer<T>): Observable<T> {
  const selectMaximum =
    typeof comparer === 'function'
      ? (previous: T, current: T) => (comparer(previous, current) > 0 ? previous : current)
      : (previous: T, current: T) => (previous > current ? previous : current);

  return this[reduce](selectMaximum);
};
