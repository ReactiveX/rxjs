export function isPromise(value: any): boolean {
  return value && typeof value.subscribe !== 'function' && typeof value.then === 'function';
}