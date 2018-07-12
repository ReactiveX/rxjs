import { FObs, Operation, PartialObserver, FOType, Sink, Source, SinkArg, Teardown, Scheduler, FObsArg } from './types';
import { Subscriber, createSubscriber } from './Subscriber';
import { Subscription, teardownToFunction } from './Subscription';
import { pipe } from './util/pipe';
import { tryUserFunction, resultIsError } from './util/userFunction';

export interface ObservableConstructor {
  <T>(init?: (subscriber: Subscriber<T>) => void): Observable<T>;
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

  forEach(nextHandler: (value: T) => void, subscription?: Subscription): Promise<void>;

  toPromise(): Promise<T>;

  // TODO: flush out types
  pipe(...operations: Array<Operation<any, any>>): Observable<any>;
}

/** The Observable constructor */
export const Observable: ObservableConstructor = function <T>(init?: (subscriber: Subscriber<T>) => Teardown) {
  return sourceAsObservable((type: FOType.SUBSCRIBE, dest: Sink<T>, subs: Subscription) => {
    const subscriber = createSubscriber(dest, subs);
    const teardown = tryUserFunction(init, subscriber);
    if (resultIsError(teardown)) {
      subscriber(FOType.ERROR, teardown.error, subs);
      return;
    }
    subs.add(teardown);
  });
} as any;

export function sourceAsObservable<T>(source: Source<T>): Observable<T> {
  const result = source as Observable<T>;
  result.subscribe = subscribe;
  result.pipe = observablePipe;
  result.forEach = forEach;
  result.toPromise = toPromise;
  if (Symbol && Symbol.observable) {
    result[Symbol.observable] = () => result;
  }
  return result;
}

function subscribe<T>(
  this: Source<T>,
  nextOrObserver?: PartialObserver<T> | ((value: T, subscription: Subscription) => void),
  errorHandler?: (err: any) => void,
  completeHandler?: () => void,
) {
  const subscription = new Subscription();;
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

function forEach<T>(this: Observable<T>, nextHandler: (value: T) => void, subscription?: Subscription): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let completed = false;
    let errored = false;
    if (subscription) {
      subscription.add(() => {
        if (!completed && !errored) {
          const error = new Error('forEach aborted');
          error.name = 'AbortError';
          reject(error);
        }
      });
    }
    subscription = subscription || new Subscription();
    this(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      switch (t) {
        case FOType.NEXT:
          // make sure the next handler is on a microtask
          Promise.resolve(v).then(nextHandler);
          break;
        case FOType.COMPLETE:
          completed = true;
          resolve(undefined);
          subs.unsubscribe();
          break;
        case FOType.ERROR:
          errored = true;
          reject(v);
          subs.unsubscribe();
          break;
        default:
          break;
      }
    }, subscription);
  });
}

function toPromise<T>(this: Observable<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    this.subscribe({
      _last: undefined,
      next (value) { this._last = value; },
      error(err) { reject(err); },
      complete() { resolve(this._last); }
    });
  })
}

function observablePipe<T>(this: Observable<T>, ...operations: Array<Operation<T, T>>): Observable<T> {
  return pipe(...operations)(this);
}

export function sinkFromObserver<T>(
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
      default:
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
      default:
        break;
    }
  };
}
