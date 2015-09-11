import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

export default function filter<T>(select: (x: T, ix?: number) => boolean, thisArg?: any) {
  return this.lift(new FilterOperator(select, thisArg));
}

class FilterOperator<T, R> implements Operator<T, R> {

  select: (x: T, ix?: number) => boolean;

  constructor(select: (x: T, ix?: number) => boolean, thisArg?: any) {
    this.select = <(x: T, ix?: number) => boolean>bindCallback(select, thisArg, 2);
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new FilterSubscriber(subscriber, this.select);
  }
}

class FilterSubscriber<T> extends Subscriber<T> {

  count: number = 0;
  select: (x: T, ix?: number) => boolean;

  constructor(destination: Observer<T>, select: (x: T, ix?: number) => boolean) {
    super(destination);
    this.select = select;
  }

  _next(x) {
    const result = tryCatch(this.select)(x, this.count++);
    if (result === errorObject) {
      this.destination.error(errorObject.e);
    } else if (Boolean(result)) {
      this.destination.next(x);
    }
  }
}
