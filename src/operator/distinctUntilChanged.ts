import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {Observable} from '../Observable';
import {_Comparer} from '../types';

export function distinctUntilChanged<T>(compare?: _Comparer<T, boolean>): Observable<T> {
  return this.lift(new DistinctUntilChangedOperator(compare));
}

class DistinctUntilChangedOperator<T> implements Operator<T, T> {
  constructor(private compare: _Comparer<T, boolean>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new DistinctUntilChangedSubscriber(subscriber, this.compare);
  }
}

class DistinctUntilChangedSubscriber<T> extends Subscriber<T> {
  private value: T;
  private hasValue: boolean = false;

  constructor(destination: Subscriber<T>, compare: _Comparer<T, boolean>) {
    super(destination);
    if (typeof compare === 'function') {
      this.compare = compare;
    }
  }

  private compare(x: T, y: T): boolean {
    return x === y;
  }

  _next(value: T): void {
    let result: any = false;

    if (this.hasValue) {
      result = tryCatch(this.compare)(this.value, value);
      if (result === errorObject) {
        this.destination.error(errorObject.e);
        return;
      }
    } else {
      this.hasValue = true;
    }

    if (Boolean(result) === false) {
      this.value = value;
      this.destination.next(value);
    }
  }
}
