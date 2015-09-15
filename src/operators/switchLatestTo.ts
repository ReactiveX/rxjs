import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import Subscription from '../Subscription';

import { FlatMapToSubscriber } from './flatMapTo-support';

export default function switchLatestTo<T, R, R2>(observable: Observable<R>,
                                             projectResult?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2): Observable<R2> {
  return this.lift(new SwitchLatestToOperator(observable, projectResult));
}

class SwitchLatestToOperator<T, R, R2> implements Operator<T, R> {
  constructor(private observable: Observable<R>,
              private resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new SwitchLatestToSubscriber(subscriber, this.observable, this.resultSelector);
  }
}

class SwitchLatestToSubscriber<T, R, R2> extends FlatMapToSubscriber<T, R, R2> {

  innerSubscription: Subscription<T>;

  constructor(destination: Observer<T>,
              observable: Observable<R>,
              resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2) {
    super(destination, observable, resultSelector, 1);
  }
}
