import { Observable } from '../Observable';
import { ObservableInput } from '../types';
import { isObject  } from './isObject';
import { isFunction } from './isFunction';

/**
 * Tests to see if the object is an RxJS {@link Observable}
 * @param obj the object to test
 */
export function isObservable<T>(obj: any): obj is Observable<T> {
  return obj && obj instanceof Observable ||
    (isObject(obj) || isFunction(obj)) ? (isFunction(obj.lift) && isFunction(obj.subscribe)) : false;
}
