import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export class ReduceOperator<T, R> implements Operator<T, R> {

  constructor(private project: (acc: R, x: T) => R,
              private seed?: R,
              private thisArg?: any) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new ReduceSubscriber(subscriber, this.project, this.seed, this.thisArg);
  }
}

export class ReduceSubscriber<T, R> extends Subscriber<T> {

  acc: R;
  hasSeed: boolean;
  hasValue: boolean = false;

  constructor(destination: Subscriber<T>,
              private project: (acc: R, x: T) => R,
              seed?: R,
              private thisArg?: any) {
    super(destination);
    this.acc = seed;
    this.hasSeed = typeof seed !== 'undefined';
  }

  _next(x) {
    if (this.hasValue || (this.hasValue = this.hasSeed)) {
      const result = tryCatch(this.project).call(this.thisArg || this, this.acc, x);
      if (result === errorObject) {
        this.destination.error(errorObject.e);
      } else {
        this.acc = result;
      }
    } else {
      this.acc = x;
      this.hasValue = true;
    }
  }

  _complete() {
    if (this.hasValue || this.hasSeed) {
      this.destination.next(this.acc);
    }
    this.destination.complete();
  }
}
