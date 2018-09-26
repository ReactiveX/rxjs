import { FObs, Operation, PartialObserver, FOType, Sink, SinkArg, Teardown } from './types';
import { Subscriber, createSubscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { tryUserFunction, resultIsError } from './util/userFunction';
import { sourceAsObservable } from './util/sourceAsObservable';

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


