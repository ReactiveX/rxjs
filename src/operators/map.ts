import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export default function map<T, R>(project: (x: T, ix?: number) => R) {
  return this.lift(new MapOperator(project));
}

export class MapOperator<T, R> extends Operator<T, R> {
  constructor(protected project: (x: T, ix?: number) => R) {
    super();
  }
  call(observer: Observer<R>): Observer<T> {
    return new MapSubscriber(observer, this.project);
  }
}

export class MapSubscriber<T, R> extends Subscriber<T> {

  constructor(public    destination: Observer<R>,
              protected project: (x: T, ix?: number) => R,
              protected count: number = 0) {
    super(destination);
  }

  _next(x) {
    const result = tryCatch(this.project).call(this, x, this.count++);
    if (result === errorObject) {
      this.error(errorObject.e);
    } else {
      this.destination.next(result);
    }
  }
}
