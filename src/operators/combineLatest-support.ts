import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

import ArrayObservable from '../observables/ArrayObservable';
import EmptyObservable from '../observables/EmptyObservable';
import {ZipSubscriber, ZipInnerSubscriber} from './zip-support';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export function combineLatest<T, R>(...observables: (Observable<any> | ((...values: Array<any>) => R))[]): Observable<R> {
  const project = <((...ys: Array<any>) => R)> observables[observables.length - 1];
  if (typeof project === "function") {
    observables.pop();
  }
  return new ArrayObservable(observables).lift(new CombineLatestOperator(project));
}

export function combineLatestProto<R>(...observables: (Observable<any>|((...values: any[]) => R))[]): Observable<R> {
  const project = <((...ys: Array<any>) => R)> observables[observables.length - 1];
  if (typeof project === "function") {
    observables.pop();
  }
  observables.unshift(this);
  return new ArrayObservable(observables).lift(new CombineLatestOperator(project));
}

export class CombineLatestOperator<T, R> implements Operator<T, R> {

  project: (...values: Array<any>) => R;

  constructor(project?: (...values: Array<any>) => R) {
    this.project = project;
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new CombineLatestSubscriber<T, R>(subscriber, this.project);
  }
}

export class CombineLatestSubscriber<T, R> extends ZipSubscriber<T, R> {

  project: (...values: Array<any>) => R;
  limit: number = 0;

  constructor(destination: Observer<R>, project?: (...values: Array<any>) => R) {
    super(destination, project, []);
  }

  _subscribeInner(observable, values, index, total) {
    return observable._subscribe(new CombineLatestInnerSubscriber(this.destination, this, values, index, total));
  }

  _innerComplete(innerSubscriber) {
    if((this.active -= 1) === 0) {
      this.destination.complete();
    }
  }
}

export class CombineLatestInnerSubscriber<T, R> extends ZipInnerSubscriber<T, R> {

  constructor(destination: Observer<T>, parent: ZipSubscriber<T, R>, values: any, index : number, total : number) {
    super(destination, parent, values, index, total);
  }

  _next(x) {

    const index = this.index;
    const total = this.total;
    const parent = this.parent;
    const values = this.values;
    const valueBox = values[index];
    let limit;

    if(valueBox) {
      valueBox[0] = x;
      limit = parent.limit;
    } else {
      limit = parent.limit += 1;
      values[index] = [x];
    }

    if(limit >= total) {
      this._projectNext(values, parent.project);
    }
  }
}
