import { FObs, PartialObserver, FOType, Sink, Source, SinkArg, Teardown, Scheduler, Subs, FObsArg } from './types';
import { Subscriber, createSubscriber } from './Subscriber';
import { Subscription, createSubs } from './Subscription';
import { defaultScheduler } from './scheduler/defaultScheduler';

export interface ObservableConstructor {
  new<T>(init?: (subscriber: Subscriber<T>) => void): Observable<T>;
}

export interface Observable<T> extends FObs<T> {
  subscribe(observer: PartialObserver<T>, scheduler?: Scheduler): Subscription;
  subscribe(
    nextHandler?: (value: T, subscription: Subscription) => void,
    errorHandler?: (err: any) => void,
    completeHandler?: () => void,
    scheduler?: Scheduler,
  ): Subscription;
  subscribe(): Subscription;
}

export const Observable: ObservableConstructor = function <T>(init?: (subscriber: Subscriber<T>) => void) {
  return sourceAsObservable((type: FOType.SUBSCRIBE, dest: Sink<T>) => {
    let teardown: Teardown;
    const subs = createSubs(() => {
      if (teardown) {
        if (typeof (teardown as Subscription).unsubscribe === 'function') {
          (teardown as Subscription).unsubscribe();
        } else if (typeof teardown === 'function') {
          (teardown as () => void)();
        }
      }
    });
    const subscriber = createSubscriber(dest);
    subscriber(FOType.SUBSCRIBE, subs);
    teardown = init(subscriber);
  });
} as any;

export function sourceAsObservable<T>(source: Source<T>): Observable<T> {
  const result = source as Observable<T>;
  result.subscribe = subscribe;
  return result;
}

function subscribe<T>(
  this: Source<T>,
  nextOrObserver?: PartialObserver<T> | ((value: T, subscription: Subscription) => void),
  errorHandlerOrScheduler?: Scheduler | ((err: any) => void),
  completeHandler?: () => void,
  scheduler?: Scheduler,
) {
  let subscription: Subscription;
  let sink: Sink<T>;
  if (nextOrObserver) {
    if (typeof nextOrObserver === 'object') {
      sink = sinkFromObserver(nextOrObserver, subs => subscription = subs);
      scheduler = errorHandlerOrScheduler as Scheduler;
    } else {
      sink = sinkFromHandlers(nextOrObserver, errorHandlerOrScheduler, completeHandler, subs => subscription = subs);
    }
  } else {
    sink = () => { /* noop */ };
  }
  if (!scheduler) {
    scheduler = defaultScheduler;
  }

  const wrappedSink = wrapWithScheduler(sink as FObs<T>, scheduler, subscription);
  scheduler(() => this(FOType.SUBSCRIBE, wrappedSink), 0, subscription);
  return subscription;
}

function sinkFromObserver<T>(
  observer: PartialObserver<T>,
  subscriptionCallback: (subs: Subscription) => void
): Sink<T> {
  let subscription: Subscription;
  return (type: FOType, arg: SinkArg<T>) => {
    switch (type) {
      case FOType.SUBSCRIBE:
        subscriptionCallback(arg);
        break;
      case FOType.NEXT:
        if (typeof observer.next === 'function') {
          observer.next(arg, subscription);
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
  subscriptionCallback: (subscription: Subscription) => void,
) {
  let subscription: Subscription;
  return (type: FOType, arg: SinkArg<T>) => {
    switch (type) {
      case FOType.SUBSCRIBE:
        subscriptionCallback(arg);
        break;
      case FOType.NEXT:
        if (typeof nextHandler === 'function') {
          nextHandler(arg, subscription);
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

function wrapWithScheduler<T>(fobs: FObs<T>, scheduler: Scheduler, subs: Subs): FObs<T> {
  return (type: FOType, arg: FObsArg<T>) => {
    scheduler(() => {
      fobs(type, arg);
    }, 0, subs);
  };
}
