import Observable from '../Observable';
import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

export default function count<T>(predicate?: (value: T,
                                              index: number,
                                              source: Observable<T>) => boolean,
                                 thisArg?: any): Observable<T> {
  return this.lift(new CountOperator(predicate, thisArg, this));
}

class CountOperator<T, R> implements Operator<T, R> {
  constructor(private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg?: any,
              private source?: Observable<T>) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new CountSubscriber<T>(
      subscriber, this.predicate, this.thisArg, this.source
    );
  }
}

class CountSubscriber<T> extends Subscriber<T> {
  private predicate: Function;
  private count: number = 0;
  private index: number = 0;

  constructor(destination: Observer<T>,
              predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg?: any,
              private source?: Observable<T>) {
    super(destination);
    if (typeof predicate === 'function') {
      this.predicate = bindCallback(predicate, thisArg, 3);
    }
  }

  _next(value: T) {
    const predicate = this.predicate;
    let passed: any = true;
    if (predicate) {
      passed = tryCatch(predicate)(value, this.index++, this.source);
      if (passed === errorObject) {
        this.destination.error(passed.e);
        return;
      }
    }
    if (passed) {
      this.count += 1;
    }
  }

  _complete() {
    this.destination.next(this.count);
    this.destination.complete();
  }
}
