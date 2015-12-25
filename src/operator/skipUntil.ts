import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';

import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export function skipUntil<T>(notifier: Observable<any>): Observable<T> {
  return this.lift(new SkipUntilOperator(notifier));
}

class SkipUntilOperator<T, R> implements Operator<T, R> {
  constructor(private notifier: Observable<any>) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new SkipUntilSubscriber(subscriber, this.notifier);
  }
}

class SkipUntilSubscriber<T, R> extends OuterSubscriber<T, R> {

  private hasValue: boolean = false;
  private isInnerStopped: boolean = false;

  constructor(destination: Subscriber<any>,
              notifier: Observable<any>) {
    super(destination);
    this.add(subscribeToResult(this, notifier));
  }

  _next(value: T) {
    if (this.hasValue) {
      super._next(value);
    }
  }

  _complete() {
    if (this.isInnerStopped) {
      super._complete();
    } else {
      this.unsubscribe();
    }
  }

  notifyNext(): void {
    this.hasValue = true;
  }

  notifyComplete(): void {
    this.isInnerStopped = true;
    if (this.isStopped) {
      super._complete();
    }
  }
}
