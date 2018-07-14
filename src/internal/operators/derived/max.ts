import { reduce } from './reduce';

const DEFAULT_COMPARER = <T>(a: T, b: T) => a > b ? a : b;

export const max = <T>(comparer?: (a: T, b: T) => number) => {
  const reducer = (typeof comparer === 'function')
    ? (a: T, b: T) => comparer(a, b) > 0 ? a : b
    : DEFAULT_COMPARER;

  return reduce(reducer);
}
