import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

import { FlatMapSubscriber } from './flatMap-support';

export class FlatMapToOperator<T, R> implements Operator<T, R> {

  observable: Observable<any>;
  projectResult: (x: T, y: any, ix: number, iy: number) => R
  concurrent: number;

  constructor(observable: Observable<any>,
              projectResult?: (x: T, y: any, ix: number, iy: number) => R,
              concurrent: number = Number.POSITIVE_INFINITY) {
    this.observable = observable;
    this.projectResult = projectResult;
    this.concurrent = concurrent;
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new FlatMapToSubscriber(subscriber, this.concurrent, this.observable, this.projectResult);
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

