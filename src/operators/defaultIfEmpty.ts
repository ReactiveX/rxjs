import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

export default function defaultIfEmpty<T,R>(defaultValue: R = null) : Observable<T>|Observable<R> {
  return this.lift(new DefaultIfEmptyOperator(defaultValue));
}

export class DefaultIfEmptyOperator<T, R> extends Operator<T, R> {

  constructor(private defaultValue: R) {
    super();
  }

  call(observer: Observer<T>): Observer<T> {
    return new DefaultIfEmptySubscriber(observer, this.defaultValue);
  }
}

export class DefaultIfEmptySubscriber<T, R> extends Subscriber<T> {

  isEmpty: boolean = true;

  constructor(destination: Observer<T>, private defaultValue: R) {
    super(destination);
  }

  _next(x) {
    this.isEmpty = false;
    this.destination.next(x);
  }

  _complete() {
    if(this.isEmpty) {
      this.destination.next(this.defaultValue);
    }
    this.destination.complete();
  }
}
