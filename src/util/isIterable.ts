import { iterator as Symbol_iterator } from '../symbol/iterator';

export function isIterable<T>(value: any): value is Iterable<T> {
  return typeof value[Symbol_iterator] === 'function';
}
