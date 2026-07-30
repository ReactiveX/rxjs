import type { ConnectableObservable } from './connectable.js';
import { multicast } from './multicast.js';
import { replaySubject } from './replay-subject.js';
import type { ObservedValueOf } from './util/types.js';

export const publishReplay: unique symbol = Symbol('publishReplay');

const SCHEDULER_ERROR = 'Scheduler-backed publishReplay is not supported by this Symbol contract.';

export interface PublishReplayTimestampProvider {
  now(): number;
}

declare global {
  interface Observable<T> {
    [publishReplay]<Selected extends ObservableValue<unknown>>(
      bufferSize: number | undefined,
      windowTime: number | undefined,
      selector: (shared: Observable<T>) => Selected,
      scheduler?: PublishReplayTimestampProvider
    ): Observable<ObservedValueOf<Selected>>;
    [publishReplay](
      bufferSize: number | undefined,
      windowTime: number | undefined,
      selector: undefined,
      scheduler: PublishReplayTimestampProvider
    ): ConnectableObservable<T>;
    [publishReplay](bufferSize?: number, windowTime?: number, scheduler?: PublishReplayTimestampProvider): ConnectableObservable<T>;
  }
}

Observable.prototype[publishReplay] = function <T, Selected extends ObservableValue<unknown>>(
  this: Observable<T>,
  bufferSize?: number,
  windowTime?: number,
  selectorOrScheduler?: ((shared: Observable<T>) => Selected) | unknown,
  scheduler?: unknown
): ConnectableObservable<T> | Observable<ObservedValueOf<Selected>> {
  if (scheduler !== undefined) {
    throw new Error(SCHEDULER_ERROR);
  }

  const selector = typeof selectorOrScheduler === 'function' ? (selectorOrScheduler as (shared: Observable<T>) => Selected) : undefined;
  if (selectorOrScheduler !== undefined && !selector) {
    throw new Error(SCHEDULER_ERROR);
  }

  const subject = replaySubject<T>({
    size: bufferSize,
    maxAge: windowTime,
  });

  if (selector) {
    return this[multicast](subject, selector);
  }

  // RxJS 7 retains one ReplaySubject for the lifetime of every publishReplay
  // result, including selector-form results that are later retried or repeated.
  return this[multicast](subject);
};
