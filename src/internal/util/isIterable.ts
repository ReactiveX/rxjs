export function isIterable<T>(obj: any): obj is Iterable<T> {
  return typeof obj[Symbol.iterator] === 'function';
}
