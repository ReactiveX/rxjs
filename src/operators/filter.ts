import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export default function filter<T>(select: (x: T) => boolean) {
  return this.lift(new FilterOperator(select));
}

export class FilterOperator<T, R> extends Operator<T, R> {

  constructor(protected select: (x: T) => boolean) {
    super();
  }

  call(observer: Observer<T>): Observer<T> {
    return new FilterSubscriber(observer, this.select);
  }
}

export class FilterSubscriber<T> extends Subscriber<T> {

  select: (x: T) => boolean;

  constructor(destination: Observer<T>, select: (x: T) => boolean) {
    super(destination);
    this.select = select;
  }

  _next(x) {
    const result = tryCatch(this.select).call(this, x);
    if (result === errorObject) {
      this.destination.error(errorObject.e);
    } else if (Boolean(result)) {
      this.destination.next(x);
    }
  }
}
