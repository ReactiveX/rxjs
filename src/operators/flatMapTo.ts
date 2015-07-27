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

  constructor(public observable: Observable<any>,
              public projectResult?: (x: T, y: any, ix: number, iy: number) => R,
              public concurrent: number = Number.POSITIVE_INFINITY) {
    super();
  }

  call(observer: Observer<R>): Observer<T> {
    return new FlatMapToSubscriber(observer, this.concurrent, this.observable, this.projectResult);
  }
}

export class FlatMapToSubscriber<T, R> extends FlatMapSubscriber<T, R> {

  constructor(public    destination: Observer<R>,
              protected concurrent: number,
              protected observable: Observable<T>,
              protected projectResult?: (x: T, y: any, ix: number, iy: number) => R) {
    super(destination, concurrent, null, projectResult);
  }

  _project(value, index) {
    return this.observable;
  }
}

