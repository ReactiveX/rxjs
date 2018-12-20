// TODO: require rxjs/core as a peer dep
import { SchedulerLike, ObservableInput, InteropObservable } from 'rxjs/internal/types';
import { isArrayLike } from 'rxjs/internal/util/isArrayLike';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { isIterable } from 'rxjs/internal/util/isIterable';
import { isObservable } from 'rxjs/internal/util/isObservable';
import { isInteropObservable } from 'rxjs/internal/util/isInteropObservable';
import { isPromiseLike } from 'rxjs/internal/util/isPromiseLike';
import { isAsyncIterable } from 'rxjs/internal/util/isAsyncIterable';
import { symbolAsyncIterator } from 'rxjs/internal/util/symbolAsyncIterator';
import { Subscriber } from '../Subscriber';

export function fromScheduled<T>(input: ObservableInput<T>, scheduler: SchedulerLike): Observable<T> {
  if (isObservable(input)) {
    return fromObservableScheduled(input, scheduler);
  } else if (isInteropObservable(input)) {
    return fromInteropObservable(input, scheduler);
  } else if (isPromiseLike(input)) {
    return fromPromiseLike(input, scheduler);
  } else if (isAsyncIterable(input)) {
    return fromAsyncIterable(input, scheduler);
  } else if (isIterable(input)) {
    return fromIterableScheduled(input as Iterable<T>, scheduler);
  } else if (isArrayLike(input)) {
    return fromArrayLikeScheduled(input, scheduler);
  } else {
    throw new Error('not implemented yet');
  }
}

// TODO: this could be refactored with subscribeOn and observeOn (perhaps "scheduleOn")?
function fromObservableScheduled<T>(
  input: Observable<T>,
  scheduler: SchedulerLike,
) {
  return new Observable<T>(subscriber => {
    scheduler.schedule(() => {
      const subscription = new Subscription();
      subscription.add(input.subscribe({
        next: (value: T) => scheduler.schedule(() => subscriber.next(value), 0, null, subscription),
        error: (err: any) => scheduler.schedule(() => subscriber.error(err), 0, null, subscription),
        complete: () => scheduler.schedule(() => subscriber.complete(), 0, null, subscription),
      }));
      return subscription;
    });
  });
}

function fromInteropObservable<T>(
  input: InteropObservable<T>,
  scheduler: SchedulerLike,
) {
  return new Observable<T>(subscriber => {
    const subscription = new Subscription();
    scheduler.schedule(() => {
      const source = input[Symbol.observable]();
      const innerSubs = source.subscribe({
        next(value) {
          scheduler.schedule(() => subscriber.next(value), 0, null, subscription);
        },
        error(err) {
          scheduler.schedule(() => subscriber.error(err), 0, null, subscription);
        },
        complete() {
          scheduler.schedule(() => subscriber.complete(), 0, null, subscription);
        }
      });
      subscription.add(innerSubs);
    }, 0, null, subscription);
    return subscription;
  });
}

function fromPromiseLike<T>(
  input: PromiseLike<T>,
  scheduler: SchedulerLike,
) {
  return new Observable<T>(subscriber => {
    const subscription = new Subscription();
    scheduler.schedule(() => {
      input.then(
        value => {
          scheduler.schedule(() => {
            subscriber.next(value);
            scheduler.schedule(() => subscriber.complete(), 0, null, subscription);
          }, 0, null, subscription);
        },
        err => {
          scheduler.schedule(() => subscriber.error(err), 0, null, subscription);
        },
      );
    }, 0, null, subscription);
    return subscription;
  });
}

function fromAsyncIterable<T>(
  input: AsyncIterable<T>,
  scheduler: SchedulerLike,
) {
  return new Observable<T>(subscriber => {
    const subscription = new Subscription();
    scheduler.schedule(() => {
      const ai: AsyncIterator<T> = input[symbolAsyncIterator]();
      const go = () => scheduler.schedule(() => {
        ai.next().then(
          result => {
            const { done, value } = result;
            if (done) {
              scheduler.schedule(() => subscriber.complete(), 0, null, subscription);
            } else {
              scheduler.schedule(() => subscriber.next(value), 0, null, subscription);
              go();
            }
          },
          err => {
            scheduler.schedule(() => subscriber.error(err), 0, null, subscription);
          }
        );
      }, 0, null, subscription);
      go();
    }, 0, null, subscription);
    return subscription;
  });
}

function fromArrayLikeScheduled<T>(
  input: ArrayLike<T>,
  scheduler: SchedulerLike,
) {
  return new Observable<T>(subscriber => {
    const subscription = new Subscription();
    let i = 0;
    scheduler.schedule(fromArrayLikeWork as any, 0, { i, input, subscription, subscriber, scheduler }, subscription);
    return subscription;
  });
}

function fromArrayLikeWork<T>(
  state: { i: number, input: ArrayLike<T>, subscription: Subscription, subscriber: Subscriber<T>, scheduler: SchedulerLike}
) {
  const { i, input, subscription: subs, subscriber, scheduler } = state;
  if (subs.closed) { return; }
  if (i < input.length) {
    if (i < input.length) {
      subscriber.next(input[state.i++]);
      if (subs.closed) { return; }
      scheduler.schedule(fromArrayLikeWork as any, 0, state, subs);
    } else {
      subscriber.complete();
    }
  }
}

function fromIterableScheduled<T>(
  input: Iterable<T>,
  scheduler: SchedulerLike,
) {
  return new Observable<T>(subscriber => {
    const subscription = new Subscription();
    const iterator = input[Symbol.iterator]();
    scheduler.schedule(fromIterableWork as any, 0, { iterator, subscription, subscriber, scheduler }, subscription);
    return subscription;
  });
}

function fromIterableWork<T>(state: { iterator: Iterator<T>, subscription: Subscription, subscriber: Subscriber<T>, scheduler: SchedulerLike }) {
  const { iterator, subscription, subscriber, scheduler } = state;
  if (subscription.closed) { return; }
  const { done, value } = iterator.next();
  if (done) {
    subscriber.complete();
  } else {
    subscriber.next(value);
    scheduler.schedule(fromIterableWork as any, 0, state, subscription);
  }
}
