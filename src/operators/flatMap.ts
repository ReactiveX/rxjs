import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

import {MergeSubscriber, MergeInnerSubscriber} from './merge';

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

  constructor(public    destination: Observer<R>,
              protected concurrent: number,
              protected project: (x: T, ix: number) => Observable<any>,
              protected projectResult?: (x: T, y: any, ix: number, iy: number) => R) {
    super(destination, concurrent);
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
    return observable.subscribe(new FlatMapInnerSubscriber(this, value, index, this.projectResult))
  }
}

export class FlatMapInnerSubscriber<T, R> extends MergeInnerSubscriber<T, R> {

  constructor(protected parent: FlatMapSubscriber<T, R>,
              protected value: any,
              protected index: number,
              protected project?: (x: T, y: any, ix: number, iy: number) => R,
              protected count: number = 0) {
    super(parent);
  }

  _next(value) {
    let result = value;
    const index = this.count++;
    const project = this.project;
    if (project) {
      result = tryCatch(project).call(this, this.value, value, this.index, index);
      if (result === errorObject) {
        this.destination.error(errorObject.e);
      } else {
        this.destination.next(result);
      }
    } else {
      this.destination.next(result);
    }
  }
}
