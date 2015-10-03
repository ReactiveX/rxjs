import Observable from '../Observable';
import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Observer from '../Observer';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';
import EmptyError from '../util/EmptyError';

export default function first<T, R>(predicate?: (value: T, index: number, source: Observable<T>) => boolean,
                                    resultSelector?: (value: T, index: number) => R,
                                    defaultValue?: any): Observable<R> {
  return this.lift(new FirstOperator(predicate, resultSelector, defaultValue, this));
}

class FirstOperator<T, R> implements Operator<T, R> {
  constructor(private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private resultSelector?: (value: T, index: number) => R,
              private defaultValue?: any,
              private source?: Observable<T>) {
  }

  call(observer: Subscriber<R>): Subscriber<T> {
    return new FirstSubscriber(observer, this.predicate, this.resultSelector, this.defaultValue, this.source);
  }
}

class FirstSubscriber<T, R> extends Subscriber<T> {
  private index: number = 0;
  private hasCompleted: boolean = false;

  constructor(destination: Observer<T>,
              private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private resultSelector?: (value: T, index: number) => R,
              private defaultValue?: any,
              private source?: Observable<T>) {
    super(destination);
  }

  _next(value: any) {
    const { destination, predicate, resultSelector } = this;
    const index = this.index++;
    let passed: any = true;
    if (predicate) {
      passed = tryCatch(predicate)(value, index, this.source);
      if (passed === errorObject) {
        destination.error(errorObject.e);
        return;
      }
    }
    if (passed) {
      if (resultSelector) {
        value = tryCatch(resultSelector)(value, index);
        if (value === errorObject) {
          destination.error(errorObject.e);
          return;
        }
      }
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
