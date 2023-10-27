import { InteropObservable } from '../types.js';
import { isFunction } from './isFunction.js';

/** Identifies an input as being Observable (but not necessary an Rx Observable) */
export function isInteropObservable(input: any): input is InteropObservable<any> {
  return isFunction(input[Symbol.observable ?? '@@observable']);
}
