import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscription from '../Subscription';

import {FlatMapToOperator, FlatMapToSubscriber} from './flatMapTo';

export default function switchLatestTo<T, R>(observable: Observable<any>,
                                             projectResult?: (x: T, y: any, ix: number, iy: number) => R) {
  return this.lift(new SwitchLatestToOperator(observable, projectResult));
}

export class SwitchLatestToOperator<T, R> extends FlatMapToOperator<T, R> {

  constructor(observable: Observable<any>,
              projectResult?: (x: T, y: any, ix: number, iy: number) => R) {
    super(observable, projectResult, 1);
  }

  call(observer: Observer<R>): Observer<T> {
    return new SwitchLatestToSubscriber(observer, this.observable, this.projectResult);
  }
}

export class SwitchLatestToSubscriber<T, R> extends FlatMapToSubscriber<T, R> {

  innerSubscription: Subscription<T>;

  constructor(destination: Observer<R>,
              observable: Observable<any>,
              projectResult?: (x: T, y: any, ix: number, iy: number) => R) {
    super(destination, 1, observable, projectResult);
  }

  _buffer(value) {
    const active = this.active;
    if(active > 0) {
      this.active = active - 1;
      const inner = this.innerSubscription;
      if(inner) {
        inner.unsubscribe()
      }
    }
    this._next(value);
  }

  _subscribeInner(observable, value, index) {
    return (this.innerSubscription = super._subscribeInner(observable, value, index));
  }
}
