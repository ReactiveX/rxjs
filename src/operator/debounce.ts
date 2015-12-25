import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';

import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export function debounce<T>(durationSelector: (value: T) => Observable<any> | Promise<any>): Observable<T> {
  return this.lift(new DebounceOperator(durationSelector));
}

class DebounceOperator<T, R> implements Operator<T, R> {
  constructor(private durationSelector: (value: T) => Observable<any> | Promise<any>) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new DebounceSubscriber(subscriber, this.durationSelector);
  }
}

class DebounceSubscriber<T, R> extends OuterSubscriber<T, R> {

  private value: T;
  private hasValue: boolean = false;
  private durationSubscription: Subscription = null;

  constructor(destination: Subscriber<R>,
              private durationSelector: (value: T) => any) {
    super(destination);
  }

  _next(value: T) {
    let subscription = this.durationSubscription;
    const duration = tryCatch(this.durationSelector)(value);

    if (duration === errorObject) {
      this.destination.error(errorObject.e);
    } else {
      this.value = value;
      this.hasValue = true;
      if (subscription) {
        subscription.unsubscribe();
        this.remove(subscription);
      }
      subscription = subscribeToResult(this, duration);
      if (!subscription.isUnsubscribed) {
        this.add(this.durationSubscription = subscription);
      }
    }
  }

  _complete() {
    this.emitValue();
    this.destination.complete();
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {
    this.emitValue();
  }

  notifyComplete(): void {
    this.emitValue();
  }

  emitValue() {
    if (this.hasValue) {
      const value = this.value;
      const subscription = this.durationSubscription;
      if (subscription) {
        this.durationSubscription = null;
        subscription.unsubscribe();
        this.remove(subscription);
      }
      this.value = null;
      this.hasValue = false;
      super._next(value);
    }
  }
}
