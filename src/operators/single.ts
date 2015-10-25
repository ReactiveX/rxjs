import Observable from '../Observable';
import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Observer from '../Observer';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';
import EmptyError from '../util/EmptyError';

export default function single<T>(predicate?: (value: T,
                                               index: number,
                                               source: Observable<T>) => boolean,
                                  thisArg?: any): Observable<T> {
  return this.lift(new SingleOperator(predicate, thisArg, this));
}

class SingleOperator<T, R> implements Operator<T, R> {
  constructor(private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg?: any,
              private source?: Observable<T>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new SingleSubscriber(subscriber, this.predicate, this.thisArg, this.source);
  }
}

class SingleSubscriber<T> extends Subscriber<T> {
  private predicate: Function;
  private seenValue: boolean = false;
  private singleValue: T;
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

  private applySingleValue(value): void {
    if (this.seenValue) {
      this.destination.error('Sequence contains more than one element');
    } else {
      this.seenValue = true;
      this.singleValue = value;
    }
  }

  _next(value: T): void {
    const predicate = this.predicate;
    const currentIndex = this.index++;

    if (predicate) {
      let result = tryCatch(predicate)(value, currentIndex, this.source);
      if (result === errorObject) {
        this.destination.error(result.e);
      } else if (result) {
        this.applySingleValue(value);
      }
    } else {
      this.applySingleValue(value);
    }
  }

  _complete(): void {
    const destination = this.destination;

    if (this.index > 0) {
      destination.next(this.seenValue ? this.singleValue : undefined);
      destination.complete();
    } else {
      destination.error(new EmptyError);
    }
  }
}