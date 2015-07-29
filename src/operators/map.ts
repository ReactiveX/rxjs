import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export default function map<T, R>(project: (x: T, ix?: number) => R) {
  return this.lift(new MapOperator(project));
}

export class MapOperator<T, R> extends Operator<T, R> {

  project: (x: T, ix?: number) => R;

  constructor(project: (x: T, ix?: number) => R) {
    super();
    this.project = project;
  }
  call(observer: Observer<R>): Observer<T> {
    return new MapSubscriber(observer, this.project);
  }
}

export class MapSubscriber<T, R> extends Subscriber<T> {

  count: number = 0;
  project: (x: T, ix?: number) => R;

  constructor(destination: Observer<R>,
              project: (x: T, ix?: number) => R) {
    super(destination);
    this.project = project;
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
