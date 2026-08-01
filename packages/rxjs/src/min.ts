import { installObservableExtension } from './util/install-observable-extension.js';
import { reduce } from './reduce.js';

export const min: unique symbol = Symbol('min');

declare global {
  interface Observable<T> {
    [min](comparer?: (previous: T, current: T) => number): Observable<T>;
  }
}

installObservableExtension({
  instance: function <T>(this: Observable<T>, comparer?: (previous: T, current: T) => number): Observable<T> {
    const selectMinimum =
      typeof comparer === 'function'
        ? (previous: T, current: T) => (comparer(previous, current) < 0 ? previous : current)
        : (previous: T, current: T) => (previous < current ? previous : current);

    return this[reduce](selectMinimum);
  },
  name: 'min',
  symbol: min,
});
