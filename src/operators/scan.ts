import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export default function scan<T, R>(project: (acc: R, x: T) => R, acc?: R) {
  return this.lift(new ScanOperator(project));
}

class ScanOperator<T, R> implements Operator<T, R> {

  acc: R;
  project: (acc: R, x: T) => R;

  constructor(project: (acc: R, x: T) => R, acc?: R) {
    this.acc = acc;
    this.project = project;
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new ScanSubscriber(subscriber, this.project, this.acc);
  }
}

class ScanSubscriber<T, R> extends Subscriber<T> {

  acc: R;
  hasSeed: boolean;
  hasValue: boolean = false;
  project: (acc: R, x: T) => R;

  constructor(destination: Subscriber<T>, project: (acc: R, x: T) => R, acc?: R) {
    super(destination);
    this.acc = acc;
    this.project = project;
    this.hasSeed = typeof acc !== 'undefined';
  }

  _next(x) {
    if (this.hasValue || (this.hasValue = this.hasSeed)) {
      const result = tryCatch(this.project).call(this, this.acc, x);
      if (result === errorObject) {
        this.destination.error(errorObject.e);
      } else {
        this.destination.next(this.acc = result);
      }
    } else {
      return this.destination.next((this.hasValue = true) && (this.acc = x));
    }
  }

  _complete() {
    if (!this.hasValue && this.hasSeed) {
      this.destination.next(this.acc);
    }
    this.destination.complete();
  }
}
