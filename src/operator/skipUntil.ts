import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';

import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
* Returns an Observable that skips items emitted by the source Observable until a second Observable emits an item.
*
* <img src="./img/skipUntil.png" width="100%">
*
* @param {Observable} the second Observable that has to emit an item before the source Observable's elements begin to
* be mirrored by the resulting Observable.
* @returns {Observable<T>} an Observable that skips items from the source Observable until the second Observable emits
* an item, then emits the remaining items.
*/
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
