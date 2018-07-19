import { FObs, Operation, PartialObserver, FOType, Sink, Source, SinkArg, Teardown } from 'rxjs/internal/types';
import { Subscriber, createSubscriber } from 'rxjs/internal/Subscriber';
import { Subscription } from 'rxjs/internal/Subscription';
import { pipe } from 'rxjs/internal/util/pipe';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';

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

  pipe(): Observable<T>;
  pipe<R>(op1: Operation<T, R>, ): Observable<R>;
  pipe<A, R>(op1: Operation<T, A>, op2: Operation<A, R>, ): Observable<R>;
  pipe<A, B, R>(op1: Operation<T, A>, op2: Operation<A, B>, op3: Operation<B, R>, ): Observable<R>;
  pipe<A, B, C, R>(op1: Operation<T, A>, op2: Operation<A, B>, op3: Operation<B, C>, op4: Operation<C, R>, ): Observable<R>;
  pipe<A, B, C, D, R>(op1: Operation<T, A>, op2: Operation<A, B>, op3: Operation<B, C>, op4: Operation<C, D>, op5: Operation<D, R>, ): Observable<R>;
  pipe<A, B, C, D, E, R>(op1: Operation<T, A>, op2: Operation<A, B>, op3: Operation<B, C>, op4: Operation<C, D>, op5: Operation<D, E>, op6: Operation<E, R>, ): Observable<R>;
  pipe<A, B, C, D, E, F, R>(op1: Operation<T, A>, op2: Operation<A, B>, op3: Operation<B, C>, op4: Operation<C, D>, op5: Operation<D, E>, op6: Operation<E, F>, op8: Operation<F, R>, ): Observable<R>;
  pipe<A, B, C, D, E, F, G, R>(op1: Operation<T, A>, op2: Operation<A, B>, op3: Operation<B, C>, op4: Operation<C, D>, op5: Operation<D, E>, op6: Operation<E, F>, op8: Operation<F, G>, op9: Operation<G, R>, ): Observable<R>;
  pipe<A, B, C, D, E, F, G, H, R>(op1: Operation<T, A>, op2: Operation<A, B>, op3: Operation<B, C>, op4: Operation<C, D>, op5: Operation<D, E>, op6: Operation<E, F>, op8: Operation<F, G>, op9: Operation<G, H>, op10: Operation<H, R>, ): Observable<R>;
  pipe<A, B, C, D, E, F, G, H, I, R>(op1: Operation<T, A>, op2: Operation<A, B>, op3: Operation<B, C>, op4: Operation<C, D>, op5: Operation<D, E>, op6: Operation<E, F>, op8: Operation<F, G>, op9: Operation<G, H>, op10: Operation<H, I>, op11: Operation<I, R>, ): Observable<R>;
  pipe<A, B, C, D, E, F, G, H, I, J, R>(op1: Operation<T, A>, op2: Operation<A, B>, op3: Operation<B, C>, op4: Operation<C, D>, op5: Operation<D, E>, op6: Operation<E, F>, op8: Operation<F, G>, op9: Operation<G, H>, op10: Operation<H, I>, op11: Operation<I, J>, op12: Operation<J, R>, ): Observable<R>;
  pipe<A, B, C, D, E, F, G, H, I, J, K, R>(op1: Operation<T, A>, op2: Operation<A, B>, op3: Operation<B, C>, op4: Operation<C, D>, op5: Operation<D, E>, op6: Operation<E, F>, op8: Operation<F, G>, op9: Operation<G, H>, op10: Operation<H, I>, op11: Operation<I, J>, op12: Operation<J, K>, op13: Operation<K, R>, ): Observable<R>;
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


