import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export function exhaust<T>(): Observable<T> {
  return this.lift(new SwitchFirstOperator());
}

class SwitchFirstOperator<T> implements Operator<T, T> {
  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new SwitchFirstSubscriber(subscriber);
  }
}

class SwitchFirstSubscriber<T> extends OuterSubscriber<T, T> {
  private hasSubscription: boolean = false;
  private hasCompleted: boolean = false;

  constructor(destination: Subscriber<T>) {
    super(destination);
  }

  _next(value: T): void {
    if (!this.hasSubscription) {
      this.hasSubscription = true;
      this.add(subscribeToResult(this, value));
    }
  }

  _complete(): void {
    this.hasCompleted = true;
    if (!this.hasSubscription) {
      this.destination.complete();
    }
  }

  notifyNext(outerValue: T, innerValue: T): void {
    this.destination.next(innerValue);
  }

  notifyError(err: any): void {
    this.destination.error(err);
  }

  notifyComplete(innerSub: Subscription<T>): void {
    this.remove(innerSub);
    this.hasSubscription = false;
    if (this.hasCompleted) {
      this.destination.complete();
    }
  }
}
