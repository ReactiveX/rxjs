export function isPromiseLike<T>(obj: any): obj is PromiseLike<T> {
  return obj != null && typeof obj.then === 'function';
}
