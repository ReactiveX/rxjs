import {Subject} from '../Subject';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';

export class BehaviorSubject<T> extends Subject<T> {
  constructor(public value: T) {
    super();
  }

  _subscribe(subscriber: Subscriber<T>): Subscription<T> {
    const subscription = super._subscribe(subscriber);
    if (!subscription) {
      return;
    } else if (!subscription.isUnsubscribed) {
      subscriber.next(this.value);
    }
    return subscription;
  }

  _next(value: T): void {
    super._next(this.value = value);
  }
}
