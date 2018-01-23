import { observable as Symbol_observable } from '../symbol/observable';

/** Identifies an input as being Observable (but not necessary an Rx Observable) */
export function isObservable<T>(input: T) {
  return input && typeof input[Symbol_observable] === 'function';
}
