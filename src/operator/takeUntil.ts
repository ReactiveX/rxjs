import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';

import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export function takeUntil<T>(notifier: Observable<any>): Observable<T> {
  return this.lift(new TakeUntilOperator(notifier));
}

class TakeUntilOperator<T> implements Operator<T, T> {
  constructor(private notifier: Observable<any>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new TakeUntilSubscriber(subscriber, this.notifier);
  }
}

class TakeUntilSubscriber<T, R> extends OuterSubscriber<T, R> {

  constructor(destination: Subscriber<any>,
              private notifier: Observable<any>) {
    super(destination);
    this.add(subscribeToResult(this, notifier));
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {
    this.complete();
  }

  notifyComplete(): void {
    // noop
  }
}
