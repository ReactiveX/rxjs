import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {bindCallback} from '../util/bindCallback';

import {_Comparer} from '../types';

export function distinctUntilChanged<T>(compare?: _Comparer<T, boolean>, thisArg?: any): Observable<T> {
  return this.lift(new DistinctUntilChangedOperator(thisArg ?
    <_Comparer<T, boolean>>bindCallback(compare, thisArg, 2) :
    compare));
}

class DistinctUntilChangedOperator<T, R> implements Operator<T, R> {

  compare: _Comparer<T, boolean>;

  constructor(compare?: _Comparer<T, boolean>) {
    this.compare = compare;
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new DistinctUntilChangedSubscriber(subscriber, this.compare);
  }
}

class DistinctUntilChangedSubscriber<T> extends Subscriber<T> {

  value: T;
  hasValue: boolean = false;

  constructor(destination: Subscriber<T>, compare?: _Comparer<T, boolean>) {
    super(destination);
    if (typeof compare === 'function') {
      this.compare = compare;
    }
  }

  compare(x: T, y: T) {
    return x === y;
  }

  _next(x) {

    let result: any = false;

    if (this.hasValue) {
      result = tryCatch(this.compare)(this.value, x);
      if (result === errorObject) {
        this.destination.error(errorObject.e);
        return;
      }
    } else {
      this.hasValue = true;
    }

    if (Boolean(result) === false) {
      this.value = x;
      this.destination.next(x);
    }
  }
}
