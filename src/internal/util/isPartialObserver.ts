import { PartialObserver } from '../types';

/**
 * Because Subjects are `typeof "function"`, we have this method to test to
 * see if something is a partial observer. Technically, anything with at least a `next`,
 * `error`, or `complete` method is a partial observer, and as a legacy, any object,
 * even if it doesn't have any of those methods, is considered a `PartialObserver`.
 *
 * In the future, we will probably want to restrict this only to values with some
 * combination of `next`, `error`, or `complete` methods on them.
 * @param o the value to test
 */
export function isPartialObserver(o: any): o is PartialObserver<any> {
  return o && (
    typeof o === 'object' ||
    typeof o.next === 'function' ||
    typeof o.error === 'function' ||
    typeof o.complete === 'function'
  );
}
