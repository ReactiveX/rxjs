import { iterator as Symbol_iterator } from '../symbol/iterator';

/** Identifies an input as being an Iterable */
export function isIterable<T>(input: T) {
  return input && typeof input[Symbol_iterator] === 'function';
}
