import { distinctUntilChanged } from './distinct-until-changed.js';

type Comparator<T> = (previous: T, current: T) => boolean;

export const distinctUntilKeyChanged: unique symbol = Symbol('distinctUntilKeyChanged');

declare global {
  interface Observable<T> {
    [distinctUntilKeyChanged]: <K extends keyof T>(key: K, comparator?: Comparator<T[K]>) => Observable<T>;
  }
}

Observable.prototype[distinctUntilKeyChanged] = function <T, K extends keyof T>(
  this: Observable<T>,
  key: K,
  comparator?: Comparator<T[K]>
): Observable<T> {
  return this[distinctUntilChanged](comparator, (value) => value[key]);
};
