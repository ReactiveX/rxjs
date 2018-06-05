import { Observable } from '../Observable';
import { isPromise } from '../util/isPromise';
import { isArrayLike } from '../util/isArrayLike';
import { isInteropObservable } from '../util/isInteropObservable';
import { isIterable } from '../util/isIterable';
import { fromArray } from './fromArray';
import { fromPromise } from './fromPromise';
import { fromIterable } from './fromIterable';
import { fromObservable } from './fromObservable';
import { subscribeTo } from '../util/subscribeTo';
import { ObservableInput, SchedulerLike } from '../types';

export function from<T>(input: ObservableInput<T>, scheduler?: SchedulerLike): Observable<T>;
export function from<T>(input: ObservableInput<ObservableInput<T>>, scheduler?: SchedulerLike): Observable<Observable<T>>;
export function from<T>(input: ObservableInput<T>, scheduler?: SchedulerLike): Observable<T> {
  if (!scheduler) {
    if (input instanceof Observable) {
      return input;
    }
    return new Observable<T>(subscribeTo(input));
  }

  if (input != null) {
    if (isInteropObservable(input)) {
      return fromObservable(input, scheduler);
    } else if (isPromise(input)) {
      return fromPromise(input, scheduler);
    } else if (isArrayLike(input)) {
      return fromArray(input, scheduler);
    }  else if (isIterable(input) || typeof input === 'string') {
      return fromIterable(input, scheduler);
    }
  }

  throw new TypeError((input !== null && typeof input || input) + ' is not observable');
}
