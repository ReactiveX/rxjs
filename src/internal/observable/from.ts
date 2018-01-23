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

export function from<T>(input: ObservableInput<T> | Promise<T> | Iterable<T>, scheduler?: IScheduler): Observable<T> {
  if (input != null) {
    if (isObservable(input)) {
      if (input instanceof Observable && !scheduler) {
        return input;
      }
      return fromObservable(input, scheduler);
    } else if (isPromise(input)) {
      return fromPromise(input, scheduler);
    } else if (isArrayLike(input)) {
      return fromArray(input, scheduler);
    }  else if (typeof input[Symbol_iterator] === 'function' || typeof input === 'string') {
      return fromIterable(input as Iterable<T>, scheduler);
    }
  }

  throw new TypeError((input !== null && typeof input || input) + ' is not observable');
}
