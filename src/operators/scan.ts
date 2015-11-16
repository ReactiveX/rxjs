import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {_Accumulator} from '../types';

export function scan<T, R>(project: _Accumulator<T, R>, acc?: R): Observable<R> {
  return this.lift(new ScanOperator(project, acc));
}

class ScanOperator<T, R> implements Operator<T, R> {

  acc: R;
  project: _Accumulator<T, R>;

  constructor(project: _Accumulator<T, R>, acc?: R) {
    this.acc = acc;
    this.project = project;
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new ScanSubscriber(subscriber, this.project, this.acc);
  }
}

class ScanSubscriber<T, R> extends Subscriber<T> {
  private _acc: R;

  get acc(): R {
    return this._acc;
  }

  set acc(value: R) {
    this.accumulatorSet = true;
    this._acc = value;
  }

  accumulatorSet: boolean = false;

  project: _Accumulator<T, R>;

  constructor(destination: Subscriber<T>, project: _Accumulator<T, R>, acc?: R) {
    super(destination);
    this.acc = acc;
    this.project = project;
    this.accumulatorSet = typeof acc !== 'undefined';
  }

  _next(x) {
    if (!this.accumulatorSet) {
      this.acc = x;
      this.destination.next(x);
    } else {
      const result = tryCatch(this.project).call(this, this.acc, x);
      if (result === errorObject) {
        this.destination.error(errorObject.e);
      } else {
        this.acc = result;
        this.destination.next(this.acc);
      }
    }
  }
}
