import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export default function withLatestFrom<R>(...args: (Observable<any>|((...values: any[]) => Observable<R>))[]): Observable<R> {
  const project = <((...values: any[]) => Observable<R>)>args.pop();
  const observables = <Observable<any>[]>args;
  return this.lift(new WithLatestFromOperator(observables, project));
}

class WithLatestFromOperator<T, R> implements Operator<T, R> {
  constructor(private observables: Observable<any>[], private project: (...values: any[]) => Observable<R>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new WithLatestFromSubscriber<T, R>(subscriber, this.observables, this.project);
  }
}

class WithLatestFromSubscriber<T, R> extends Subscriber<T> {
  private values: any[];
  private toSet: number;
  
  constructor(destination: Observer<T>, private observables: Observable<any>[], private project: (...values: any[]) => Observable<R>) {
    super(destination);
    const len = observables.length;
    this.values = new Array(len);
    this.toSet = len;
    for (let i = 0; i < len; i++) {
      this.add(observables[i]._subscribe(new WithLatestInnerSubscriber(this, i)))
    }
  }
  
  notifyValue(index, value) {
    this.values[index] = value;
    this.toSet--;
  }
  
  _next(value: T) {
    if (this.toSet === 0) {
      const values = this.values;
      let result = tryCatch(this.project)([value, ...values]);
      if (result === errorObject) {
        this.destination.error(result.e);
      } else {
        this.destination.next(result);
      }
    }
  }
}

class WithLatestInnerSubscriber<T, R> extends Subscriber<T> {
  constructor(private parent: WithLatestFromSubscriber<T, R>, private valueIndex: number) {
    super(null)
  }
  
  _next(value: T) {
    this.parent.notifyValue(this.valueIndex, value);
  }
  
  _error(err: any) {
    this.parent.error(err);
  }
  
  _complete() {
    // noop
  }
}
