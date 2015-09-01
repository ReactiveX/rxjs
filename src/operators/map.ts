import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

export default function map<T, R>(project: (x: T, ix?: number) => R, thisArg?: any) {
  return this.lift(new MapOperator(project, thisArg));
}

class MapOperator<T, R> implements Operator<T, R> {

  project: (x: T, ix?: number) => R;

  constructor(project: (x: T, ix?: number) => R, thisArg?: any) {
    this.project = <(x: T, ix?: number) => R>bindCallback(project, thisArg, 2);
  }
  call(observer: Observer<R>): Observer<T> {
    return new MapSubscriber(observer, this.project);
  }
}

class MapSubscriber<T, R> extends Subscriber<T> {

  count: number = 0;
  project: (x: T, ix?: number) => R;

  constructor(destination: Observer<R>,
              project: (x: T, ix?: number) => R) {
    super(destination);
    this.project = project;
  }

  _next(x) {
    const result = tryCatch(this.project)(x, this.count++);
    if (result === errorObject) {
      this.error(errorObject.e);
    } else {
      this.destination.next(result);
    }
  }
}
