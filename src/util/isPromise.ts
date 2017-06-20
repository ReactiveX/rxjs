export function isPromise<T>(value: any | PromiseLike<T>): value is PromiseLike<T> {
  return value && typeof (<any>value).subscribe !== 'function' && typeof (value as any).then === 'function';
}
