import { Operation, PartialObserver, FOType, Sink, Source, SinkArg } from '../types';
import { Subscription } from '../Subscription';
import { pipeArray } from './pipe';
import { Observable } from '../Observable';
import { sinkFromObserver } from './sinkFromObserver';

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

function subscribe<T>(this: Source<T>, nextOrObserver?: PartialObserver<T> | ((value: T, subscription: Subscription) => void), errorHandler?: (err: any) => void, completeHandler?: () => void) {
  const subscription = new Subscription();
  ;
  let sink: Sink<T>;
  if (nextOrObserver) {
    if (typeof nextOrObserver === 'object') {
      sink = sinkFromObserver(nextOrObserver);
    }
    else {
      sink = sinkFromHandlers(nextOrObserver, errorHandler, completeHandler);
    }
  }
  else {
    sink = () => { };
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
      next(value) { this._last = value; },
      error(err) { reject(err); },
      complete() { resolve(this._last); }
    });
  });
}
function observablePipe<T>(this: Observable<T>, ...operations: Array<Operation<T, T>>): Observable<T> {
  return pipeArray(operations)(this);
}

export function sinkFromHandlers<T>(
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
