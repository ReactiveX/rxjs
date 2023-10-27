import { InteropObservable } from '../types.js';
import { observable as Symbol_observable } from '../symbol/observable.js';
import { isFunction } from './isFunction.js';

/** Identifies an input as being Observable (but not necessary an Rx Observable) */
export function isInteropObservable(input: any): input is InteropObservable<any> {
  return isFunction(input[Symbol_observable]);
}
