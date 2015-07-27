import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export default function reduce<T, R>(project: (acc: R, x: T) => R, acc?: R) {
  return this.lift(new ReduceOperator(project));
}

export class ReduceOperator<T, R> extends Operator<T, R> {

  constructor(protected project: (acc: R, x: T) => R,
              protected acc?: R) {
    super();
  }

  call(observer: Observer<T>): Observer<T> {
    return new ReduceSubscriber(observer, this.project, this.acc);
  }
}

export class ReduceSubscriber<T, R> extends Subscriber<T> {

  constructor(public    destination: Observer<T>,
              protected project: (acc: R, x: T) => R,
              protected acc?: R,
              protected hasValue: boolean = false,
              protected hasSeed: boolean = typeof acc !== "undefined") {
    super(destination);
  }

  _next(x) {
    if(this.hasValue || (this.hasValue = this.hasSeed)) {
      const result = tryCatch(this.project).call(this, this.acc, x);
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
    if(this.hasValue || this.hasSeed) {
      this.destination.next(this.acc);
    }
    this.destination.complete();
  }
}
