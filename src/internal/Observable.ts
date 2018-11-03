import { FObs, OperatorFunction, PartialObserver, FOType, Sink, SinkArg, TeardownLogic } from 'rxjs/internal/types';
import { Subscriber, createSubscriber } from 'rxjs/internal/Subscriber';
import { Subscription } from 'rxjs/internal/Subscription';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { sourceAsObservable } from 'rxjs/internal/util/sourceAsObservable';

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
  pipe(...operations: Array<OperatorFunction<any, any>>): Observable<any>;
}

/** The Observable constructor */
export const Observable: ObservableConstructor = function <T>(init?: (subscriber: Subscriber<T>) => TeardownLogic) {
  return sourceAsObservable((type: FOType.SUBSCRIBE, dest: Sink<T>, subs: Subscription) => {
    if (init) {
      const subscriber = createSubscriber(dest, subs);
      const teardown = tryUserFunction(init, subscriber);
      if (resultIsError(teardown)) {
        subscriber(FOType.ERROR, teardown.error, subs);
        subs.unsubscribe();
        return;
      }
      subs.add(teardown);
    }
  });
} as any;


