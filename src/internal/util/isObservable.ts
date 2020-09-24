/** @prettier */
import { Observable } from '../Observable';
import { isFunction } from './isFunction';

/**
 * Tests to see if the object is an RxJS {@link Observable}
 * @param obj the object to test
 */
export function isObservable<T>(obj: any): obj is Observable<T> {
  return !!obj && (obj instanceof Observable || (isFunction(obj.lift) && isFunction(obj.subscribe)));
}
