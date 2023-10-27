import { scheduleObservable } from './scheduleObservable.js';
import { schedulePromise } from './schedulePromise.js';
import { scheduleArray } from './scheduleArray.js';
import { scheduleIterable } from './scheduleIterable.js';
import { scheduleAsyncIterable } from './scheduleAsyncIterable.js';
import { isInteropObservable } from '../util/isInteropObservable.js';
import { isPromise } from '../util/isPromise.js';
import { isArrayLike } from '../util/isArrayLike.js';
import { isIterable } from '../util/isIterable.js';
import { ObservableInput, SchedulerLike } from '../types.js';
import { Observable } from '../Observable.js';
import { isAsyncIterable } from '../util/isAsyncIterable.js';
import { createInvalidObservableTypeError } from '../util/throwUnobservableError.js';
import { isReadableStreamLike } from '../util/isReadableStreamLike.js';
import { scheduleReadableStreamLike } from './scheduleReadableStreamLike.js';

/**
 * Converts from a common {@link ObservableInput} type to an observable where subscription and emissions
 * are scheduled on the provided scheduler.
 *
 * @see {@link from}
 * @see {@link of}
 *
 * @param input The observable, array, promise, iterable, etc you would like to schedule
 * @param scheduler The scheduler to use to schedule the subscription and emissions from
 * the returned observable.
 */
export function scheduled<T>(input: ObservableInput<T>, scheduler: SchedulerLike): Observable<T> {
  if (input != null) {
    if (isInteropObservable(input)) {
      return scheduleObservable(input, scheduler);
    }
    if (isArrayLike(input)) {
      return scheduleArray(input, scheduler);
    }
    if (isPromise(input)) {
      return schedulePromise(input, scheduler);
    }
    if (isAsyncIterable(input)) {
      return scheduleAsyncIterable(input, scheduler);
    }
    if (isIterable(input)) {
      return scheduleIterable(input, scheduler);
    }
    if (isReadableStreamLike(input)) {
      return scheduleReadableStreamLike(input, scheduler);
    }
  }
  throw createInvalidObservableTypeError(input);
}
