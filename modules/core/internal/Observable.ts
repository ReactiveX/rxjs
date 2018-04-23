import { FObs, Operation, PartialObserver, FOType, Sink, Source, SinkArg, Teardown, Scheduler, FObsArg } from './types';
import { Subscriber, createSubscriber } from './Subscriber';
import { Subscription, teardownToFunction } from './Subscription';
import { pipe } from './util/pipe';

export interface ObservableConstructor {
  new<T>(init?: (subscriber: Subscriber<T>) => void): Observable<T>;
}

export interface Observable<T> extends FObs<T> {
  subscribe(observer: PartialObserver<T>): Subscription;
  subscribe(
    nextHandler?: (value: T, subscription: Subscription) => void,
    errorHandler?: (err: any) => void,
    completeHandler?: () => void,
  ): Subscription;
  subscribe(): Subscription;

  // TODO: flush out types
  pipe(...operations: Array<Operation<any, any>>): Observable<any>;
}

export const Observable: ObservableConstructor = function <T>(init?: (subscriber: Subscriber<T>) => void) {
  return sourceAsObservable((type: FOType.SUBSCRIBE, dest: Sink<T>, subs: Subscription) => {
    let teardown: Teardown;
    subs.add(() => teardownToFunction(teardown)());
    const subscriber = createSubscriber(dest, subs);
    teardown = init(subscriber);
  });
} as any;

export function sourceAsObservable<T>(source: Source<T>): Observable<T> {
  const result = source as Observable<T>;
  (result as any).__proto__ = Observable.prototype;
  result.subscribe = subscribe;
  result.pipe = observablePipe;
  return result;
}

function subscribe<T>(
  this: Source<T>,
  nextOrObserver?: PartialObserver<T> | ((value: T, subscription: Subscription) => void),
  errorHandler?: (err: any) => void,
  completeHandler?: () => void,
) {
  let subscription = new Subscription();;
  let sink: Sink<T>;

  if (nextOrObserver) {
    if (typeof nextOrObserver === 'object') {
      sink = sinkFromObserver(nextOrObserver);
    } else {
      sink = sinkFromHandlers(nextOrObserver, errorHandler, completeHandler);
    }
  } else {
    sink = () => { /* noop */ };
  }

  this(FOType.SUBSCRIBE, sink, subscription);
  return subscription;
}

function observablePipe<T>(this: Observable<T>, ...operations: Array<Operation<T, T>>): Observable<T> {
  return pipe(...operations)(this);
}

function sinkFromObserver<T>(
  observer: PartialObserver<T>
): Sink<T> {
  return (type: FOType, arg: SinkArg<T>, subs: Subscription) => {
    switch (type) {
      case FOType.NEXT:
        if (typeof observer.next === 'function') {
          observer.next(arg, subs);
        }
        break;
      case FOType.ERROR:
        if (typeof observer.error === 'function') {
          observer.error(arg);
        }
        break;
      case FOType.COMPLETE:
        if (typeof observer.complete === 'function') {
          observer.complete();
        }
        break;
    }
  };
}

function sinkFromHandlers<T>(
  nextHandler: (value: T, subscription: Subscription) => void,
  errorHandler: (err: any) => void,
  completeHandler: () => void,
) {
  return (type: FOType, arg: SinkArg<T>, subs: Subscription) => {
    switch (type) {
      case FOType.NEXT:
        if (typeof nextHandler === 'function') {
          nextHandler(arg, subs);
        }
        break;
      case FOType.ERROR:
        if (typeof errorHandler === 'function') {
          errorHandler(arg);
        }
        break;
      case FOType.COMPLETE:
        if (typeof completeHandler === 'function') {
          completeHandler();
        }
        break;
    }
  };
}
