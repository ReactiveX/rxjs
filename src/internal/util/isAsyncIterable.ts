import { isFunction } from './isFunction.js';

export function isAsyncIterable<T>(obj: any): obj is AsyncIterable<T> {
  return Symbol.asyncIterator && isFunction(obj?.[Symbol.asyncIterator]);
}
