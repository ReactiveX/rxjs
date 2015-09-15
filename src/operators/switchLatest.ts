import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import Subscription from '../Subscription';

import { FlatMapSubscriber } from './flatMap-support';

export default function switchLatest<T, R, R2>(project: (value: T, index: number) => Observable<R>,
                                           resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2): Observable<R>{
  return this.lift(new SwitchLatestOperator(project, resultSelector));
}

class SwitchLatestOperator<T, R, R2> implements Operator<T, R> {
  constructor(private project: (value: T, index: number) => Observable<R>,
              private resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new SwitchLatestSubscriber(subscriber, this.project, this.resultSelector);
  }
}

class SwitchLatestSubscriber<T, R, R2> extends FlatMapSubscriber<T, R, R2> {

  innerSubscription: Subscription<T>;

  constructor(destination: Observer<T>,
              project: (value: T, index: number) => Observable<R>,
              resultSelector?: (innerValue: R, outerValue: T, innerIndex: number, outerIndex: number) => R2) {
    super(destination, project, resultSelector, 1);
  }
}
