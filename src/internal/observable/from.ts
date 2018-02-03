import { Observable, ObservableInput} from '../Observable';
import { IScheduler } from '../Scheduler';
import { isPromise } from '../util/isPromise';
import { isArrayLike } from '../util/isArrayLike';
import { isObservable } from '../util/isObservable';
import { iterator as Symbol_iterator } from '../symbol/iterator';
import { fromArray } from './fromArray';
import { fromPromise } from './fromPromise';
import { fromIterable } from './fromIterable';
import { fromObservable } from './fromObservable';
import { subscribeTo } from '../util/subscribeTo';

export function from<T>(input: ObservableInput<T>, scheduler?: IScheduler): Observable<T> {
  if (!scheduler) {
    if (input instanceof Observable) {
      return input;
    }
    return new Observable(subscribeTo(input));
  }

  if (input != null) {
    if (isObservable(input)) {
      return fromObservable(input, scheduler);
    } else if (isPromise(input)) {
      return fromPromise<T>(input as any, scheduler);
    } else if (isArrayLike(input)) {
      return fromArray(input, scheduler);
    }  else if (typeof input[Symbol_iterator] === 'function' || typeof input === 'string') {
      return fromIterable(input as any, scheduler);
    }
  }

  throw new TypeError((input !== null && typeof input || input) + ' is not observable');
}
