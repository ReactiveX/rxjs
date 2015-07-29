import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

import {MergeSubscriber, MergeInnerSubscriber} from './merge';
import ScalarObservable from '../observables/ScalarObservable';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export default function flatMap<T, R>(project: (x: T, ix: number) => Observable<any>,
                                      projectResult?: (x: T, y: any, ix: number, iy: number) => R,
                                      concurrent?: number) {
  return this.lift(new FlatMapOperator(project, projectResult, concurrent));
}

export class FlatMapOperator<T, R> extends Operator<T, R> {

  constructor(protected project: (x: T, ix: number) => Observable<any>,
              protected projectResult?: (x: T, y: any, ix: number, iy: number) => R,
              protected concurrent: number = Number.POSITIVE_INFINITY) {
    super();
  }

  call(observer: Observer<R>): Observer<T> {
    return new FlatMapSubscriber(observer, this.concurrent, this.project, this.projectResult);
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

  _subscribeInner(observable, value, index) {
    const projectResult = this.projectResult;
    if(projectResult) {
      return observable.subscribe(new FlatMapInnerSubscriber(this, value, index, projectResult));
    } else if(observable instanceof ScalarObservable) {
      this.destination.next((<ScalarObservable<T>> observable).value);
      this._innerComplete();
    } else {
      return observable.subscribe(new MergeInnerSubscriber(this));
    }
  }
}

export class FlatMapInnerSubscriber<T, R> extends MergeInnerSubscriber<T, R> {

  value: any;
  index: number;
  project: (x: T, y: any, ix: number, iy: number) => R;
  count: number = 0;

  constructor(parent: FlatMapSubscriber<T, R>,
              value: any,
              index: number,
              project?: (x: T, y: any, ix: number, iy: number) => R) {
    super(parent);
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
