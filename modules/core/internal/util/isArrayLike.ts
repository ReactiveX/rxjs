export function isArrayLike<T>(obj: any): obj is ArrayLike<T> {
  return obj && typeof obj.length === 'number';
}
