import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable, ObservableInput} from '../Observable';
import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * @param {Observable} observables the observables to get the latest values from.
 * @param {Function} [project] optional projection function for merging values together. Receives all values in order
 *  of observables passed. (e.g. `a.withLatestFrom(b, c, (a1, b1, c1) => a1 + b1 + c1)`). If this is not passed, arrays
 *  will be returned.
 * @description merges each value from an observable with the latest values from the other passed observables.
 * All observables must emit at least one value before the resulting observable will emit
 *
 * #### example
 * ```
 * A.withLatestFrom(B, C)
 *
 *  A:     ----a-----------------b---------------c-----------|
 *  B:     ---d----------------e--------------f---------|
 *  C:     --x----------------y-------------z-------------|
 * result: ---([a,d,x])---------([b,e,y])--------([c,f,z])---|
 * ```
 * @method withLatestFrom
 * @owner Observable
 */
export function withLatestFrom<T, R>(...args: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R> {
  let project: any;
  if (typeof args[args.length - 1] === 'function') {
    project = args.pop();
  }
  const observables = <Observable<any>[]>args;
  return this.lift(new WithLatestFromOperator(observables, project));
}

/* tslint:disable:max-line-length */
export interface WithLatestFromSignature<T> {
  <R>(project: (v1: T) => R): Observable<R>;
  <T2, R>(v2: ObservableInput<T2>, project: (v1: T, v2: T2) => R): Observable<R>;
  <T2, T3, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, project: (v1: T, v2: T2, v3: T3) => R): Observable<R>;
  <T2, T3, T4, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => R): Observable<R>;
  <T2, T3, T4, T5, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R): Observable<R>;
  <T2, T3, T4, T5, T6, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R): Observable<R>;

  <T2>(v2: ObservableInput<T2>): Observable<[T, T2]>;
  <T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<[T, T2, T3]>;
  <T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<[T, T2, T3, T4]>;
  <T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<[T, T2, T3, T4, T5]>;
  <T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<[T, T2, T3, T4, T5, T6]>;

  <R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R>;
  <R>(array: ObservableInput<any>[]): Observable<R>;
  <R>(array: ObservableInput<any>[], project: (...values: Array<any>) => R): Observable<R>;
}
/* tslint:enable:max-line-length */

class WithLatestFromOperator<T, R> implements Operator<T, R> {
  constructor(private observables: Observable<any>[],
              private project?: (...values: any[]) => Observable<R>) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new WithLatestFromSubscriber(subscriber, this.observables, this.project);
  }
}

class WithLatestFromSubscriber<T, R> extends OuterSubscriber<T, R> {
  private values: any[];
  private toRespond: number[] = [];

  constructor(destination: Subscriber<R>,
              private observables: Observable<any>[],
              private project?: (...values: any[]) => Observable<R>) {
    super(destination);
    const len = observables.length;
    this.values = new Array(len);

    for (let i = 0; i < len; i++) {
      this.toRespond.push(i);
    }

    for (let i = 0; i < len; i++) {
      let observable = observables[i];
      this.add(subscribeToResult<T, R>(this, observable, <any>observable, i));
    }
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this.values[outerIndex] = innerValue;
    const toRespond = this.toRespond;
    if (toRespond.length > 0) {
      const found = toRespond.indexOf(outerIndex);
      if (found !== -1) {
        toRespond.splice(found, 1);
      }
    }
  }

  notifyComplete() {
    // noop
  }

  protected _next(value: T) {
    if (this.toRespond.length === 0) {
      const args = [value, ...this.values];
      if (this.project) {
        this._tryProject(args);
      } else {
        this.destination.next(args);
      }
    }
  }

  private _tryProject(args: any[]) {
    let result: any;
    try {
      result = this.project.apply(this, args);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(result);
  }
}
