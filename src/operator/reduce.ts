import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export function reduce<T, R>(project: (acc: R, value: T) => R, seed?: R): Observable<R> {
  return this.lift(new ReduceOperator(project, seed));
}

export class ReduceOperator<T, R> implements Operator<T, R> {

  constructor(private project: (acc: R, value: T) => R, private seed?: R) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new ReduceSubscriber(subscriber, this.project, this.seed);
  }
}

export class ReduceSubscriber<T, R> extends Subscriber<T> {

  acc: T | R;
  hasSeed: boolean;
  hasValue: boolean = false;
  project: (acc: R, value: T) => R;

  constructor(destination: Subscriber<T>, project: (acc: R, value: T) => R, seed?: R) {
    super(destination);
    this.acc = seed;
    this.project = project;
    this.hasSeed = typeof seed !== 'undefined';
  }

  protected _next(x: T) {
    if (this.hasValue || (this.hasValue = this.hasSeed)) {
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

  protected _complete() {
    if (this.hasValue || this.hasSeed) {
      this.destination.next(this.acc);
    }
    this.destination.complete();
  }
}
