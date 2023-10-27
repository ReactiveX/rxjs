import { isFunction } from './isFunction.js';

/**
 * Tests to see if the object is "thennable".
 * @param value the object to test
 */
export function isPromise(value: any): value is PromiseLike<any> {
  return isFunction(value?.then);
}
