import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observer} from '../Observer';

import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {EmptyError} from '../util/EmptyError';
import {_PredicateObservable} from '../types';

export function single<T>(predicate?: _PredicateObservable<T>): Observable<T> {
  return this.lift(new SingleOperator(predicate, this));
}

class SingleOperator<T> implements Operator<T, T> {
  constructor(private predicate?: _PredicateObservable<T>,
              private source?: Observable<T>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new SingleSubscriber(subscriber, this.predicate, this.source);
  }
}

class SingleSubscriber<T> extends Subscriber<T> {
  private seenValue: boolean = false;
  private singleValue: T;
  private index: number = 0;

  constructor(destination: Observer<T>,
              private predicate?: _PredicateObservable<T>,
              private source?: Observable<T>) {
    super(destination);
  }

  private applySingleValue(value: T): void {
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
      if (result as any === errorObject) {
        this.destination.error(errorObject.e);
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
