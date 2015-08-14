import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

export default function distinctUntilChanged<T>(compare?: (x: T, y: T) => boolean, thisArg?: any) {
  return this.lift(new DistinctUntilChangedOperator(thisArg ?
    <(x: T, y: T) => boolean> bindCallback(compare, thisArg, 2) :
    compare));
}

export class DistinctUntilChangedOperator<T, R> extends Operator<T, R> {

  compare: (x: T, y: T) => boolean;

  constructor(compare?: (x: T, y: T) => boolean) {
    super();
    this.compare = compare;
  }

  call(observer: Observer<T>): Observer<T> {
    return new DistinctUntilChangedSubscriber(observer, this.compare);
  }
}

export class DistinctUntilChangedSubscriber<T> extends Subscriber<T> {

  value: T;
  hasValue: boolean = false;

  constructor(destination: Observer<T>, compare?: (x: T, y: T) => boolean) {
    super(destination);
    if (typeof compare === "function") {
      this.compare = compare;
    }
  }

  compare(x: T, y: T) {
    return x === y;
  }

  _next(x) {

    let result: any = false;

    if(this.hasValue) {
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
