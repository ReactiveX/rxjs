import { Observer } from '../types';
import { isFunction } from './isFunction';

export function isObserver<T>(value: any): value is Observer<T> {
  return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
}
