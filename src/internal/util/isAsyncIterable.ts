import { symbolAsyncIterator } from './symbolAsyncIterator';

export function isAsyncIterable<T>(obj: any): obj is AsyncIterable<T> {
  return typeof obj[symbolAsyncIterator] === 'function';
}
