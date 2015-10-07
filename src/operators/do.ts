import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

import noop from '../util/noop';
import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

export default function _do<T>(nextOrObserver?: Observer<T>|((x: T) => void), error?: (e: any) => void, complete?: () => void) {
  let next;
  if (nextOrObserver && typeof nextOrObserver === 'object') {
    next = (<Observer<T>>nextOrObserver).next;
    error = (<Observer<T>>nextOrObserver).error;
    complete = (<Observer<T>>nextOrObserver).complete;
  } else {
    next = <(x: T) => void>nextOrObserver;
  }
  return this.lift(new DoOperator(next || noop, error || noop, complete || noop));
}

class DoOperator<T, R> implements Operator<T, R> {

  next: (x: T) => void;
  error: (e: any) => void;
  complete: () => void;

  constructor(next: (x: T) => void, error: (e: any) => void, complete: () => void) {
    this.next = next;
    this.error = error;
    this.complete = complete;
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new DoSubscriber(subscriber, this.next, this.error, this.complete);
  }
}

class DoSubscriber<T> extends Subscriber<T> {

  __next: (x: T) => void;
  __error: (e: any) => void;
  __complete: () => void;

  constructor(destination: Subscriber<T>, next: (x: T) => void, error: (e: any) => void, complete: () => void) {
    super(destination);
    this.__next = next;
    this.__error = error;
    this.__complete = complete;
  }

  _next(x) {
    const result = tryCatch(this.__next)(x);
    if (result === errorObject) {
      this.destination.error(errorObject.e);
    } else {
      this.destination.next(x);
    }
  }

  _error(e) {
    const result = tryCatch(this.__error)(e);
    if (result === errorObject) {
      this.destination.error(errorObject.e);
    } else {
      this.destination.error(e);
    }
  }

  _complete() {
    const result = tryCatch(this.__complete)();
    if (result === errorObject) {
      this.destination.error(errorObject.e);
    } else {
      this.destination.complete();
    }
  }
}
