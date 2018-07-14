import { reduce } from 'rxjs/internal/operators/derived/reduce';

const DEFAULT_COMPARER = <T>(a: T, b: T) => a > b ? b : a;

export const min = <T>(comparer?: (a: T, b: T) => number) => {
  const reducer = (typeof comparer === 'function')
    ? (a: T, b: T) => comparer(a, b) > 0 ? b : a
    : DEFAULT_COMPARER;

  return reduce(reducer);
};
