import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import OuterSubscriber from '../OuterSubscriber';
import subscribeToResult from '../util/subscribeToResult';

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
 */
export default function withLatestFrom<R>(...args: (Observable<any>|((...values: any[]) => Observable<R>))[]): Observable<R> {
  let project;
  if (typeof args[args.length - 1] === 'function') {
    project = args.pop();
  }
  const observables = <Observable<any>[]>args;
  return this.lift(new WithLatestFromOperator(observables, project));
}

class WithLatestFromOperator<T, R> implements Operator<T, R> {
  constructor(private observables: Observable<any>[],
              private project?: (...values: any[]) => Observable<R>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new WithLatestFromSubscriber<T, R>(subscriber, this.observables, this.project);
  }
}

class WithLatestFromSubscriber<T, R> extends OuterSubscriber<T, R> {
  private values: any[];
  private toRespond: number[] = [];

  constructor(destination: Subscriber<T>,
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

  notifyNext(observable, value, observableIndex, index) {
    this.values[observableIndex] = value;
    const toRespond = this.toRespond;
    if (toRespond.length > 0) {
      const found = toRespond.indexOf(observableIndex);
      if (found !== -1) {
        toRespond.splice(found, 1);
      }
    }
  }

  notifyComplete() {
    // noop
  }

  _next(value: T) {
    if (this.toRespond.length === 0) {
      const values = this.values;
      const destination = this.destination;
      const project = this.project;
      const args = [value, ...values];
      if (project) {
        let result = tryCatch(this.project).apply(this, args);
        if (result === errorObject) {
          destination.error(result.e);
        } else {
          destination.next(result);
        }
      } else {
        destination.next(args);
      }
    }
  }
}
