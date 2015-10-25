import Observable from '../Observable';
import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Observer from '../Observer';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import EmptyError from '../util/EmptyError';

export default function last<T, R>(predicate?: (value: T, index: number, source: Observable<T>) => boolean,
                                   resultSelector?: (value: T, index: number) => R,
                                   defaultValue?: any): Observable<R> {
  return this.lift(new LastOperator(predicate, resultSelector, defaultValue, this));
}

class LastOperator<T, R> implements Operator<T, R> {
  constructor(private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private resultSelector?: (value: T, index: number) => R,
              private defaultValue?: any,
              private source?: Observable<T>) {
  }

  call(observer: Subscriber<R>): Subscriber<T> {
    return new LastSubscriber(observer, this.predicate, this.resultSelector, this.defaultValue, this.source);
  }
}

class LastSubscriber<T, R> extends Subscriber<T> {
  private lastValue: T;
  private hasValue: boolean = false;
  private index: number = 0;

  constructor(destination: Subscriber<R>,
              private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private resultSelector?: (value: T, index: number) => R,
              private defaultValue?: any,
              private source?: Observable<T>) {
    super(destination);
    if (typeof defaultValue !== 'undefined') {
      this.lastValue = defaultValue;
      this.hasValue = true;
    }
  }

  _next(value: T): void {
    const { predicate, resultSelector, destination } = this;
    const index = this.index++;

    if (predicate) {
      let found = tryCatch(predicate)(value, index, this.source);
      if (found === errorObject) {
        destination.error(errorObject.e);
        return;
      }

      if (found) {
        if (resultSelector) {
          let result = tryCatch(resultSelector)(value, index);
          if (result === errorObject) {
            destination.error(errorObject.e);
            return;
          }
          this.lastValue = result;
        } else {
          this.lastValue = value;
        }
        this.hasValue = true;
      }
    } else {
      this.lastValue = value;
      this.hasValue = true;
    }
  }

  _complete(): void {
    const destination = this.destination;
    if (this.hasValue) {
      destination.next(this.lastValue);
      destination.complete();
    } else {
      destination.error(new EmptyError);
    }
  }
}