import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';

import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export function throttle<T>(durationSelector: (value: T) => Observable<number> | Promise<number>): Observable<T> {
  return this.lift(new ThrottleOperator(durationSelector));
}

class ThrottleOperator<T> implements Operator<T, T> {
  constructor(private durationSelector: (value: T) => Observable<number> | Promise<number>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new ThrottleSubscriber(subscriber, this.durationSelector);
  }
}

class ThrottleSubscriber<T, R> extends OuterSubscriber<T, R> {
  private throttled: Subscription;

  constructor(destination: Subscriber<any>,
              private durationSelector: (value: T) => Observable<number> | Promise<number>) {
    super(destination);
  }

  _next(value: T): void {
    if (!this.throttled) {
      const duration = tryCatch(this.durationSelector)(value);
      if (duration === errorObject) {
        this.destination.error(errorObject.e);
      } else {
        this.add(this.throttled = subscribeToResult(this, duration));
        this.destination.next(value);
      }
    }
  }

  _unsubscribe() {
    const throttled = this.throttled;
    if (throttled) {
      this.remove(throttled);
      this.throttled = null;
      throttled.unsubscribe();
    }
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {
    this._unsubscribe();
  }

  notifyComplete(): void {
    this._unsubscribe();
  }
}
