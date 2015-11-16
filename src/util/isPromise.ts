export function isPromise<T>(value: any): value is Promise<T> {
  return value && typeof value.subscribe !== 'function' && typeof value.then === 'function';
}
