import { scheduleObservable } from './scheduleObservable.js';
import { schedulePromise } from './schedulePromise.js';
import { scheduleArray } from './scheduleArray.js';
import { scheduleIterable } from './scheduleIterable.js';
import { scheduleAsyncIterable } from './scheduleAsyncIterable.js';
import type { InteropObservable, ObservableInput, SchedulerLike } from '../types.js';
import type { Observable} from '@rxjs/observable';
import { ObservableInputType, getObservableInputType } from '@rxjs/observable';
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
  const type = getObservableInputType(input);
  switch (type) {
    case ObservableInputType.Own:
    case ObservableInputType.InteropObservable:
      return scheduleObservable(input as InteropObservable<T>, scheduler);
    case ObservableInputType.Promise:
      return schedulePromise(input as Promise<T>, scheduler);
    case ObservableInputType.ArrayLike:
      return scheduleArray(input as ArrayLike<T>, scheduler);
    case ObservableInputType.Iterable:
      return scheduleIterable(input as Iterable<T>, scheduler);
    case ObservableInputType.AsyncIterable:
      return scheduleAsyncIterable(input as AsyncIterable<T>, scheduler);
    case ObservableInputType.ReadableStreamLike:
      return scheduleReadableStreamLike(input as ReadableStream<T>, scheduler);
  }
}
