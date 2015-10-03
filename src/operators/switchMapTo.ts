import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import Subscription from '../Subscription';

import { MergeMapToSubscriber } from './mergeMapTo-support';

export default function switchMapTo<T, R, R2>(observable: Observable<R>,
                                              projectResult?: (outerValue: T,
                                                               innerValue: R,
                                                               outerIndex: number,
                                                               innerIndex: number) => R2): Observable<R2> {
  return this.lift(new SwitchMapToOperator(observable, projectResult));
}

class SwitchMapToOperator<T, R, R2> implements Operator<T, R> {
  constructor(private observable: Observable<R>,
              private resultSelector?: (outerValue: T,
                                        innerValue: R,
                                        outerIndex: number,
                                        innerIndex: number) => R2) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new SwitchMapToSubscriber(subscriber, this.observable, this.resultSelector);
  }
}

class SwitchMapToSubscriber<T, R, R2> extends MergeMapToSubscriber<T, R, R2> {
  innerSubscription: Subscription<T>;

  constructor(destination: Observer<T>,
              observable: Observable<R>,
              resultSelector?: (outerValue: T,
                                innerValue: R,
                                outerIndex: number,
                                innerIndex: number) => R2) {
    super(destination, observable, resultSelector, 1);
  }
}
