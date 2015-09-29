import Observable from '../Observable';
import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Observer from '../Observer';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';
import EmptyError from '../util/EmptyError';

export default function first<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean,
                                 thisArg?: any,
                                 defaultValue?: any): Observable<T> {
  return this.lift(new FirstOperator(predicate, thisArg, defaultValue, this));
}

class FirstOperator<T, R> implements Operator<T, R> {
  constructor(private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg?: any,
              private defaultValue?: any,
              private source?: Observable<T>) {
  }

  call(observer: Subscriber<R>): Subscriber<T> {
    return new FirstSubscriber(
      observer, this.predicate, this.thisArg, this.defaultValue, this.source
    );
  }
}

class FirstSubscriber<T> extends Subscriber<T> {
  private predicate: Function;
  private index: number = 0;
  private hasCompleted: boolean = false;

  constructor(destination: Observer<T>,
              predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg?: any,
              private defaultValue?: any,
              private source?: Observable<T>) {
    super(destination);
    if (typeof predicate === 'function') {
      this.predicate = bindCallback(predicate, thisArg, 3);
    }
  }

  _next(value: T) {
    const destination = this.destination;
    const predicate = this.predicate;
    let passed: any = true;
    if (predicate) {
      passed = tryCatch(predicate)(value, this.index++, this.source);
      if (passed === errorObject) {
        destination.error(passed.e);
        return;
      }
    }
    if (passed) {
      destination.next(value);
      destination.complete();
      this.hasCompleted = true;
    }
  }

  _complete() {
    const destination = this.destination;
    if (!this.hasCompleted && typeof this.defaultValue !== 'undefined') {
      destination.next(this.defaultValue);
      destination.complete();
    } else if (!this.hasCompleted) {
      destination.error(new EmptyError);
    }
  }
}
