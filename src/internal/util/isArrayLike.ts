export function isArrayLike<T>(obj: any): obj is ArrayLike<T> {
  return obj != null && typeof obj !== 'function' && typeof obj.length === 'number';
}
