import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

import { MergeSubscriber, MergeInnerSubscriber } from './merge-support';
import ScalarObservable from '../observables/ScalarObservable';

import tryCatch from '../util/tryCatch';
import { errorObject } from '../util/errorObject';

export class FlatMapOperator<T, R> implements Operator<T, R> {

  project: (x: T, ix: number) => Observable<any>;
  projectResult: (x: T, y: any, ix: number, iy: number) => R;
  concurrent: number;

  constructor(project: (x: T, ix: number) => Observable<any>,
              projectResult?: (x: T, y: any, ix: number, iy: number) => R,
              concurrent: number = Number.POSITIVE_INFINITY) {
    this.project = project;
    this.projectResult = projectResult;
    this.concurrent = concurrent;
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new FlatMapSubscriber(subscriber, this.concurrent, this.project, this.projectResult);
  }
}

export class FlatMapSubscriber<T, R> extends MergeSubscriber<T, R> {

  project: (x: T, ix: number) => Observable<any>;
  projectResult: (x: T, y: any, ix: number, iy: number) => R;

  constructor(destination: Observer<R>,
              concurrent: number,
              project: (x: T, ix: number) => Observable<any>,
              projectResult?: (x: T, y: any, ix: number, iy: number) => R) {
    super(destination, concurrent);
    this.project = project;
    this.projectResult = projectResult;
  }

  _project(value, index) {
    const observable = tryCatch(this.project).call(this, value, index);
    if (observable === errorObject) {
      this.error(errorObject.e);
      return null;
    }
    return observable;
  }

  _subscribeInner(observable:Observable<T>, value, index) {
    const projectResult = this.projectResult;
    if(projectResult) {
      return observable._subscribe(new FlatMapInnerSubscriber(this.destination, this, value, index, projectResult));
    } else if(observable._isScalar) {
      this.destination.next((<any> observable).value);
      this._innerComplete();
    } else {
      return observable._subscribe(new MergeInnerSubscriber(this.destination, this));
    }
  }
}

export class FlatMapInnerSubscriber<T, R> extends MergeInnerSubscriber<T, R> {

  value: any;
  index: number;
  project: (x: T, y: any, ix: number, iy: number) => R;
  count: number = 0;

  constructor(destination: Observer<T>,
              parent: FlatMapSubscriber<T, R>,
              value: any,
              index: number,
              project?: (x: T, y: any, ix: number, iy: number) => R) {
    super(destination, parent);
    this.value = value;
    this.index = index;
    this.project = project;
  }

  _next(value) {
    let result = value;
    const index = this.count++;
    result = tryCatch(this.project).call(this, this.value, value, this.index, index);
    if (result === errorObject) {
      this.destination.error(errorObject.e);
    } else {
      this.destination.next(result);
    }
  }
}
