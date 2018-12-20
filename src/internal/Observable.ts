import { OperatorFunction, PartialObserver, TeardownLogic, Operator } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { pipeArray } from './util/pipe';
import { OperatorSubscriber } from './OperatorSubscriber';
import { SafeSubscriber } from './SafeSubscriber';
import { Subscriber } from './Subscriber';

export class Observable<T> {
  protected _operator: Operator<T>;
  protected _source: Observable<any>;

  constructor(private _subscribe?: (subscriber: Subscriber<T>) => TeardownLogic) {}

  protected _init(subscriber: Subscriber<T>): TeardownLogic {
    if (this._subscribe) {
      const result = tryUserFunction(this._subscribe, [subscriber], this);
      if (resultIsError(result)) {
        subscriber.error(result.error);
        return;
      }
      return result;
    }
  }

  subscribe(observer: PartialObserver<T>): Subscription;
  subscribe(observer: PartialObserver<T>, subscription: Subscription): Subscription;
  subscribe(
    nextHandler?: (value: T, subscription: Subscription) => void,
    errorHandler?: (err: any) => void,
    completeHandler?: () => void,
    subscription?: Subscription,
  ): Subscription;
  subscribe(): Subscription;

  subscribe(
    nextOrObserver?: PartialObserver<T>|((value: T, subscription: Subscription) => void),
    errorHandler?: ((err: any) => void)|Subscription,
    completeHandler?: () => void,
    subscription?: Subscription,
  ): Subscription {
    if (typeof nextOrObserver === 'function') {
      subscription = subscription || new Subscription();
      errorHandler = typeof errorHandler === 'function' ? errorHandler : null;
    } else {
      if (errorHandler instanceof Subscription) {
        subscription = errorHandler;
        errorHandler = null;
      } else {
        subscription = new Subscription();
      }
    }

    const subscriber = nextOrObserver instanceof OperatorSubscriber
      ? nextOrObserver
      : new SafeSubscriber(subscription, nextOrObserver, errorHandler as any, completeHandler);

    if (this._operator) {
      this._operator.call(subscriber, this._source, subscription);
    } else {
      subscription.add(this._init(subscriber));
    }

    return subscription;
  }

  lift<R>(operator: Operator<T>): Observable<R> {
    const lifted = new Observable<R>();
    lifted._operator = operator;
    lifted._source = this;
    return lifted;
  }

  forEach(nextHandler: (value: T) => void, subscription?: Subscription): Promise<void> {
    return new Promise((resolve, reject) => {
      let result: any;

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

      this.subscribe({
        next(value) {
          result = tryUserFunction(nextHandler, [value]);
          if (resultIsError(result)) {
            errored = true;
            reject(result.error);
            subscription.unsubscribe();
          }
        },
        error(err) {
          errored = true;
          reject(err);
        },
        complete() {
          completed = true;
          resolve(result);
        }
      }, subscription);
    });
  }

  toPromise(): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.subscribe({
        _last: undefined,
        next(value) { this._last = value; },
        error(err) { reject(err); },
        complete() { resolve(this._last); }
      });
    });
  }

  /* tslint:disable:max-line-length */
  pipe(): Observable<T>;
  pipe<R>(op1: OperatorFunction<T, R>, ): Observable<R>;
  pipe<A, R>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, R>, ): Observable<R>;
  pipe<A, B, R>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, R>, ): Observable<R>;
  pipe<A, B, C, R>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, R>, ): Observable<R>;
  pipe<A, B, C, D, R>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, R>, ): Observable<R>;
  pipe<A, B, C, D, E, R>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, R>, ): Observable<R>;
  pipe<A, B, C, D, E, F, R>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op8: OperatorFunction<F, R>, ): Observable<R>;
  pipe<A, B, C, D, E, F, G, R>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op8: OperatorFunction<F, G>, op9: OperatorFunction<G, R>, ): Observable<R>;
  pipe<A, B, C, D, E, F, G, H, R>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op8: OperatorFunction<F, G>, op9: OperatorFunction<G, H>, op10: OperatorFunction<H, R>, ): Observable<R>;
  pipe<A, B, C, D, E, F, G, H, I, R>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op8: OperatorFunction<F, G>, op9: OperatorFunction<G, H>, op10: OperatorFunction<H, I>, op11: OperatorFunction<I, R>, ): Observable<R>;
  pipe<A, B, C, D, E, F, G, H, I, J, R>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op8: OperatorFunction<F, G>, op9: OperatorFunction<G, H>, op10: OperatorFunction<H, I>, op11: OperatorFunction<I, J>, op12: OperatorFunction<J, R>, ): Observable<R>;
  pipe<A, B, C, D, E, F, G, H, I, J, K, R>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op8: OperatorFunction<F, G>, op9: OperatorFunction<G, H>, op10: OperatorFunction<H, I>, op11: OperatorFunction<I, J>, op12: OperatorFunction<J, K>, op13: OperatorFunction<K, R>, ): Observable<R>;
  /* tslint:enable:max-line-length */

  pipe(...operations: Array<OperatorFunction<any, any>>): Observable<any> {
    return pipeArray(operations)(this);
  }

}
