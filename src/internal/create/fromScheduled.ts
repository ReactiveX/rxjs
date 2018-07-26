// TODO: require rxjs/core as a peer dep
import { SchedulerLike, ObservableInput, FOType, Sink } from "../types";
import { isArrayLike } from "../util/isArrayLike";
import { sourceAsObservable, Observable } from "../Observable";
import { Subscription } from "../Subscription";
import { isIterable } from "../util/isIterable";

export function fromScheduled<T>(input: ObservableInput<T>, scheduler: SchedulerLike): Observable<T> {
  if (isIterable(input)) {
    return sourceAsObservable(fromIterableScheduledSource(input as Iterable<T>, scheduler));
  } else if (isArrayLike(input)) {
    return sourceAsObservable(fromArrayLikeScheduledSource(input, scheduler));
  }
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
