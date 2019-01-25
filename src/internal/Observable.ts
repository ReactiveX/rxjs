import { OperatorFunction, PartialObserver, TeardownLogic, Operator } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { pipeArray } from './util/pipe';
import { Subscriber } from './Subscriber';
import { MutableSubscriber, MutableObserverSubscriber } from 'rxjs/internal/MutableSubscriber';
import { hostReportError } from 'rxjs/internal/util/hostReportError';
import { noop } from 'rxjs';

export class Observable<T> {
  constructor(private _subscribe?: (subscriber: Subscriber<T>) => TeardownLogic) {}

  protected _reconcileMutableSubscriber(nextOrObserver?: PartialObserver<T>|((value: T, subscription: Subscription) => void)): MutableSubscriber<T> {
    if (nextOrObserver instanceof MutableSubscriber) {
      return nextOrObserver;
    } else {
      if (nextOrObserver && typeof nextOrObserver === 'object') {
        return new MutableObserverSubscriber(nextOrObserver);
      } else {
        const mut = new MutableSubscriber<T>(noop, hostReportError, noop);
        mut.next = (value: T) => {
          if (!mut.closed) {
            (nextOrObserver as (value: T, subscription: Subscription) => void)(value, mut.subscription);
          }
        };
        return mut;
      }
    }
  }

  protected _init(mut: MutableSubscriber<T>): TeardownLogic {
    return this._subscribe(new Subscriber(mut));
  }

  subscribe(nextOrObserver?: PartialObserver<T>|((value: T, subscription: Subscription) => void)): Subscription {
    const mut = this._reconcileMutableSubscriber(nextOrObserver);
    const subscription = mut.subscription;
    const teardown = tryUserFunction(this._init, [mut], this);
    if (resultIsError(teardown)) {
      mut.error(teardown.error);
    } else {
      subscription.add(teardown);
    }
    return subscription;
  }

  lift<R>(operator: Operator<T>): Observable<R> {
    return new LiftedObservable<R>(operator, this);
  }

  forEach(nextHandler: (value: T) => void, subscription?: Subscription): Promise<void> {
    return new Promise((resolve, reject) => {
      let result: any;
      let completed = false;
      let errored = false;

      const innerSub = this.subscribe({
        next(value) {
          result = tryUserFunction(nextHandler, [value]);
          if (resultIsError(result)) {
            errored = true;
            reject(result.error);
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
      });

      if (subscription) {
        subscription.add(() => {
          if (!completed && !errored) {
            const error = new Error('forEach aborted');
            error.name = 'AbortError';
            reject(error);
          }
        });
        subscription.add(innerSub);
      }
    });
  }

  toPromise(): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let _last: T;
      this.subscribe({
        next(value) { _last = value; },
        error(err) { reject(err); },
        complete() { resolve(_last); }
      });
    });
  }

  /* tslint:disable:max-line-length */
  pipe(): Observable<T>;
  pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
  pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
  pipe<A, B, C>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Observable<C>;
  pipe<A, B, C, D>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>): Observable<D>;
  pipe<A, B, C, D, E>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>): Observable<E>;
  pipe<A, B, C, D, E, F>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>): Observable<F>;
  pipe<A, B, C, D, E, F, G>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>): Observable<G>;
  pipe<A, B, C, D, E, F, G, H>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>): Observable<H>;
  pipe<A, B, C, D, E, F, G, H, I>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>, op9: OperatorFunction<H, I>): Observable<I>;
  pipe<A, B, C, D, E, F, G, H, I>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>, op9: OperatorFunction<H, I>, ...operations: OperatorFunction<any, any>[]): Observable<{}>;
  /* tslint:enable:max-line-length */

  /**
   * Used to stitch together functional operators into a chain.
   * @method pipe
   * @return {Observable} the Observable result of all of the operators having
   * been called in the order they were passed in.
   *
   * ### Example
   * ```ts
   * import { interval } from 'rxjs';
   * import { map, filter, scan } from 'rxjs/operators';
   *
   * interval(1000)
   *   .pipe(
   *     filter(x => x % 2 === 0),
   *     map(x => x + x),
   *     scan((acc, x) => acc + x)
   *   )
   *   .subscribe(x => console.log(x))
   * ```
   */
  pipe(...operations: OperatorFunction<any, any>[]): Observable<any> {
    if (operations.length === 0) {
      return this as any;
    }

    return pipeArray(operations)(this);
  }

}

class LiftedObservable<T> extends Observable<T> {
  constructor(private _operator: Operator<any>, private _source: Observable<any>) {
    super();
  }

  _init(mut: MutableSubscriber<T>) {
    this._operator.call(mut, this._source);
  }
}
