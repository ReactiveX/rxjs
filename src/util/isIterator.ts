import {$$iterator} from '../util/Symbol_iterator';
export function isIterator<T>(value: any): value is Iterator<T> {
  return value && typeof value[$$iterator] === 'function';
}
