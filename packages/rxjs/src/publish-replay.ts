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
    [publishReplay]<Selected extends ObservableInput<unknown>>(
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

Observable.prototype[publishReplay] = function <T, Selected extends ObservableInput<unknown>>(
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

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `publishReplay` form of the exact-Symbol `[publishReplay]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[publishReplay]` to its source.
 */
export function pipeablePublishReplay<T, Selected extends ObservableInput<unknown>>(bufferSize: number | undefined, windowTime: number | undefined, selector: (shared: Observable<T>) => Selected, scheduler?: PublishReplayTimestampProvider): (source: Observable<T>) => Observable<ObservedValueOf<Selected>>;
export function pipeablePublishReplay(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[publishReplay] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
