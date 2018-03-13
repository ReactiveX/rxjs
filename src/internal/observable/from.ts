import { Observable } from '../Observable';
import { isPromise } from '../util/isPromise';
import { isArrayLike } from '../util/isArrayLike';
import { isObservableLike } from '../util/isObservableLike';
import { isIterable } from '../util/isIterable';
import { fromArray } from './fromArray';
import { fromPromise } from './fromPromise';
import { fromIterable } from './fromIterable';
import { fromObservableLike } from './fromObservable';
import { subscribeTo } from '../util/subscribeTo';
import { ObservableInput, SchedulerLike, ObservableLike } from '../types';

export function from<T>(input: ObservableInput<T>, scheduler?: SchedulerLike): Observable<T>;
export function from<T>(input: ObservableInput<ObservableInput<T>>, scheduler?: SchedulerLike): Observable<Observable<T>>;
export function from<T>(input: ObservableInput<T>, scheduler?: SchedulerLike): Observable<T> {
  if (!scheduler) {
    if (input instanceof Observable) {
      return input;
    }
    return new Observable(subscribeTo(input));
  }

  if (input != null) {
    // We need to check both instanceof and isObservableLike because
    // Symbol.observable might not be polyfilled.
    if (input instanceof Observable || isObservableLike(input)) {
      // HACK(benlesh): Typings around Symbol.observable get tricky here.
      return fromObservableLike(input as ObservableLike<T>, scheduler);
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
