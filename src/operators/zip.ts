import Operator from '../Operator';
import Observer from '../Observer';
import Scheduler from '../Scheduler';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

import ArrayObservable from '../observables/ArrayObservable';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export default function zip<T, R>(...xs: (Observable<any> | ((...values: Array<any>) => R)) []) {
  const project = <((...ys: Array<any>) => R)> xs[xs.length - 1];
  if (typeof project === "function") {
    xs.pop();
  }
  if (typeof this.subscribe === "function") {
    return new ArrayObservable([this].concat(xs)).lift(new ZipOperator(project));
  }
  return new ArrayObservable(xs).lift(new ZipOperator(project));
}

export class ZipOperator<T, R> extends Operator<T, R> {

  constructor(protected project?: (...values: Array<any>) => R) {
    super();
  }

  call(observer: Observer<R>): Observer<T> {
    return new ZipSubscriber<T, R>(observer, this.project);
  }
}

export class ZipSubscriber<T, R> extends Subscriber<T> {

  constructor(public    destination: Observer<R>,
              public    project?: (...values: Array<any>) => R,
              public    limit: number = Number.POSITIVE_INFINITY,
              protected values: any = Object.create(null),
              protected active: number = 0,
              protected observables: Observable<any>[] = []) {
    super(destination);
    this.project = (typeof project === "function") ? project : null;
  }

  _next(observable) {
    this.observables.push(observable);
  }

  _complete() {

    const values = this.values;
    const observables = this.observables;

    let index = -1;
    const len = observables.length;

    this.active = len;

    while(++index < len) {
      this.add(this._subscribeInner(observables[index], values, index, len));
    }
  }

  _subscribeInner(observable, values, index, total) {
    return observable.subscribe(new ZipInnerSubscriber(this, values, index, total));
  }

  _innerComplete(innerSubscriber) {
    if((this.active -= 1) === 0) {
      this.destination.complete();
    } else {
      this.limit = innerSubscriber.events;
    }
  }
}

export class ZipInnerSubscriber<T, R> extends Subscriber<T> {

  constructor(protected parent: ZipSubscriber<T, R>,
              protected values: any,
              protected index : number,
              protected total : number,
              protected events: number = 0) {
    super(parent.destination);
  }

  _next(x) {

    const parent = this.parent;
    const events = this.events;
    const limit = parent.limit;

    if (events >= limit) {
      this.destination.complete();
      return;
    }

    const index = this.index;
    const values = this.values;
    const zipped = values[events] || (values[events] = []);

    zipped[index] = [x];

    if (zipped.length === this.total && zipped.every(hasValue)) {
      this._projectNext(zipped, parent.project);
      values[events] = undefined;
    }

    this.events = events + 1;
  }

  _projectNext(values: Array<any>, project?: (...xs: Array<any>) => R) {
    if(project && typeof project === "function") {
      const result = tryCatch(project).apply(null, values.map(mapValue));
      if(result === errorObject) {
        this.destination.error(errorObject.e);
        return;
      } else {
        this.destination.next(result);
      }
    } else {
      this.destination.next(values.map(mapValue));
    }
  }

  _complete() {
    this.parent._innerComplete(this);
  }
}

export function mapValue(xs) { return xs[0]; }
export function hasValue(xs) { return xs && xs.length === 1; }
