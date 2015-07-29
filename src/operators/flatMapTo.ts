import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

import {FlatMapSubscriber} from './flatMap';

export default function flatMapTo<T, R>(observable: Observable<any>,
                                        projectResult?: (x: T, y: any, ix: number, iy: number) => R,
                                        concurrent?: number) {
  return this.lift(new FlatMapToOperator(observable, projectResult, concurrent));
}

export class FlatMapToOperator<T, R> extends Operator<T, R> {

  observable: Observable<any>;
  projectResult: (x: T, y: any, ix: number, iy: number) => R
  concurrent: number;

  constructor(observable: Observable<any>,
              projectResult?: (x: T, y: any, ix: number, iy: number) => R,
              concurrent: number = Number.POSITIVE_INFINITY) {
    super();
    this.observable = observable;
    this.projectResult = projectResult;
    this.concurrent = concurrent;
  }

  call(observer: Observer<R>): Observer<T> {
    return new FlatMapToSubscriber(observer, this.concurrent, this.observable, this.projectResult);
  }
}

export class FlatMapToSubscriber<T, R> extends FlatMapSubscriber<T, R> {

  observable: Observable<T>;

  constructor(destination: Observer<R>,
              concurrent: number,
              observable: Observable<T>,
              projectResult?: (x: T, y: any, ix: number, iy: number) => R) {
    super(destination, concurrent, null, projectResult);
    this.observable = observable;
  }

  _project(value, index) {
    return this.observable;
  }
}

