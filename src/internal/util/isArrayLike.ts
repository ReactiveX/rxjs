export const isArrayLike = <T>(x: any): x is ArrayLike<T> =>
  Boolean(x && typeof x.length === 'number' && typeof x !== 'function' && typeof x !== 'string');
