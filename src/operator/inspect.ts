import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {Subscription} from '../Subscription';

import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export function inspect<T>(durationSelector: (value: T) => Observable<any> | Promise<any>): Observable<T> {
  return this.lift(new InspectOperator(durationSelector));
}

class InspectOperator<T> implements Operator<T, T> {
  constructor(private durationSelector: (value: T) => Observable<any> | Promise<any>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new InspectSubscriber<T, T>(subscriber, this.durationSelector);
  }
}

class InspectSubscriber<T, R> extends OuterSubscriber<T, R> {

  private value: T;
  private hasValue: boolean = false;
  private throttled: Subscription;

  constructor(destination: Subscriber<T>,
              private durationSelector: (value: T) => Observable<any> | Promise<any>) {
    super(destination);
  }

  protected _next(value: T): void {
    this.value = value;
    this.hasValue = true;
    if (!this.throttled) {
      const duration = tryCatch(this.durationSelector)(value);
      if (duration === errorObject) {
        this.destination.error(errorObject.e);
      } else {
        this.add(this.throttled = subscribeToResult(this, duration));
      }
    }
  }

  clearThrottle() {
    const { value, hasValue, throttled } = this;
    if (throttled) {
      this.remove(throttled);
      this.throttled = null;
      throttled.unsubscribe();
    }
    if (hasValue) {
      this.value = null;
      this.hasValue = false;
      this.destination.next(value);
    }
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {
    this.clearThrottle();
  }

  notifyComplete(): void {
    this.clearThrottle();
  }
}
