export function isAsyncIterable<T>(obj: any): obj is AsyncIterable<T> {
  return typeof obj[Symbol.asyncIterator] === 'function';
}
