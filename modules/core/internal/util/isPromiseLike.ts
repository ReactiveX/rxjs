export function isPromiseLike<T>(obj: any): obj is PromiseLike<T> {
  return obj && typeof obj.then === 'function';
}
