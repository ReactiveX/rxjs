import { ObservableLike } from '../types';
import { observable as Symbol_observable } from '../symbol/observable';

/** Identifies an input as being Observable (but not necessary an Rx Observable) */
export function isObservable(input: any): input is ObservableLike<any> {
  return input && typeof input[Symbol_observable] === 'function';
}
