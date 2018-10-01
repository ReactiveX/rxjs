// TODO: require rxjs/core as a peer dep
import { SchedulerLike, ObservableInput, FOType, Sink, SinkArg, InteropObservable } from '../types';
import { isArrayLike } from '../util/isArrayLike';
import { Observable } from '../Observable';
import { sourceAsObservable } from '../util/sourceAsObservable';
import { Subscription } from '../Subscription';
import { isIterable } from '../util/isIterable';
import { isObservable } from '../util/isObservable';
import { isInteropObservable } from '../util/isInteropObservable';
import { isPromiseLike } from '../util/isPromiseLike';
import { isAsyncIterable } from '../util/isAsyncIterable';
import { symbolAsyncIterator } from '../util/symbolAsyncIterator';

export function fromScheduled<T>(input: ObservableInput<T>, scheduler: SchedulerLike): Observable<T> {
  if (isObservable(input)) {
    return sourceAsObservable(fromObservableScheduledSource(input, scheduler));
  } else if (isInteropObservable(input)) {
    return sourceAsObservable(fromInteropObservableSource(input, scheduler));
  } else if (isPromiseLike(input)) {
    return sourceAsObservable(fromPromiseLikeSource(input, scheduler));
  } else if (isAsyncIterable(input)) {
    return sourceAsObservable(fromAsyncIterableSource(input, scheduler));
  } else if (isIterable(input)) {
    return sourceAsObservable(fromIterableScheduledSource(input as Iterable<T>, scheduler));
  } else if (isArrayLike(input)) {
    return sourceAsObservable(fromArrayLikeScheduledSource(input, scheduler));
  } else {
    throw new Error('not implemented yet');
  }
}

// TODO: this could be refactored with subscribeOn and observeOn (perhaps "scheduleOn")?
function fromObservableScheduledSource<T>(
  input: Observable<T>,
  scheduler: SchedulerLike,
) {
  return (type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      scheduler.schedule(() => {
        input(FOType.SUBSCRIBE, (t: FOType, a: SinkArg<T>, subs: Subscription) => {
          scheduler.schedule(() => {
            sink(t, a, subs);
          }, 0, null, subs);
        }, subs);
      }, 0, null, subs);
    }
  };
}

function fromInteropObservableSource<T>(
  input: InteropObservable<T>,
  scheduler: SchedulerLike,
) {
  return (type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      scheduler.schedule(() => {
        const source = input[Symbol.observable]();
        const innerSubs = source.subscribe({
          next(value) {
            scheduler.schedule(() => sink(FOType.NEXT, value, subs), 0, null, subs);
          },
          error(err) {
            scheduler.schedule(() => {
              sink(FOType.ERROR, err, subs);
            }, 0, null, subs);
          },
          complete() {
            scheduler.schedule(() => {
              sink(FOType.COMPLETE, undefined, subs);
            }, 0, null, subs);
          }
        });
        subs.add(innerSubs);
      }, 0, null, subs);
    }
  };
}

function fromPromiseLikeSource<T>(
  input: PromiseLike<T>,
  scheduler: SchedulerLike,
) {
  return (type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      scheduler.schedule(() => {
        input.then(
          value => {
            scheduler.schedule(() => {
              sink(FOType.NEXT, value, subs);
              scheduler.schedule(() => sink(FOType.COMPLETE, undefined, subs), 0, null, subs);
            }, 0, null, subs);
          },
          err => {
            scheduler.schedule(() => sink(FOType.ERROR, err, subs), 0, null, subs);
          },
        );
      }, 0, null, subs);
    }
  };
}

function fromAsyncIterableSource<T>(
  input: AsyncIterable<T>,
  scheduler: SchedulerLike,
) {
  return (type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      scheduler.schedule(() => {
        const ai: AsyncIterator<T> = input[symbolAsyncIterator]();
        const go = () => scheduler.schedule(() => {
          ai.next().then(
            result => {
              const { done, value } = result;
              if (done) {
                scheduler.schedule(() => sink(FOType.COMPLETE, undefined, subs), 0, null, subs);
              } else {
                scheduler.schedule(() => sink(FOType.NEXT, value, subs), 0, null, subs);
                go();
              }
            },
            err => {
              scheduler.schedule(() => sink(FOType.ERROR, err, subs), 0, null, subs);
            }
          );
        }, 0, null, subs);
        go();
      }, 0, null, subs);
    }
  };
}

function fromArrayLikeScheduledSource<T>(
  input: ArrayLike<T>,
  scheduler: SchedulerLike,
) {
  return (type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      let i = 0;
      scheduler.schedule(fromArrayLikeWork as any, 0, { i, input, subs, sink, scheduler }, subs);
    }
  };
}

function fromArrayLikeWork<T>(state: { i: number, input: ArrayLike<T>, subs: Subscription, sink: Sink<T>, scheduler: SchedulerLike}) {
  const { i, input, subs, sink, scheduler } = state;
  if (subs.closed) return;
  if (i < input.length) {
    if (i < input.length) {
      sink(FOType.NEXT, input[state.i++], subs);
      if (subs.closed) return;
      scheduler.schedule(fromArrayLikeWork as any, 0, state, subs);
    } else {
      sink(FOType.COMPLETE, undefined, subs);
    }
  }
}

function fromIterableScheduledSource<T>(
  input: Iterable<T>,
  scheduler: SchedulerLike,
) {
  return (type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      const iterator = input[Symbol.iterator]();
      scheduler.schedule(fromIterableWork as any, 0, { iterator, subs, sink, scheduler }, subs);
    }
  };
}

function fromIterableWork<T>(state: { iterator: Iterator<T>, subs: Subscription, sink: Sink<T>, scheduler: SchedulerLike }) {
  const { iterator, subs, sink, scheduler } = state;
  if (subs.closed) return;
  const { done, value } = iterator.next();
  if (done) {
    sink(FOType.COMPLETE, undefined, subs);
  } else {
    sink(FOType.NEXT, value, subs);
    scheduler.schedule(fromIterableWork as any, 0, state, subs);
  }
}
