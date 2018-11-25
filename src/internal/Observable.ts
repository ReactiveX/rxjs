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
    const result = tryUserFunction(this._init, subscriber);
    if (resultIsError(result)) {
      subscriber.error(result.error);
    }
  }
  
  subscribe(observer: PartialObserver<T>): Subscription;
  subscribe(
    nextHandler?: (value: T, subscription: Subscription) => void,
    errorHandler?: (err: any) => void,
    completeHandler?: () => void,
    subscription?: Subscription,
  ): Subscription;
  subscribe(): Subscription;

  subscribe(
    nextOrObserver?: PartialObserver<T>|((value: T, subscription: Subscription) => void),
    errorHandler?: (err: any) => void,
    completeHandler?: () => void, 
    subscription?: Subscription,
  ): Subscription {
    subscription = subscription || new Subscription();

    const subscriber = nextOrObserver instanceof OperatorSubscriber
      ? nextOrObserver
      : new SafeSubscriber(subscription, nextOrObserver, errorHandler, completeHandler);
    
    subscription.add(this._operator ? this._operator.call(subscriber, this._source, subscription) : this._init(subscriber));
  
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
      reject('not implemented');
    });
  }
  
  toPromise(): Promise<T> {
    return Promise.reject('not implented');
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