import {Subject} from '../Subject';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';

export class BehaviorSubject<T> extends Subject<T> {
  constructor(private _value: T) {
    super();
  }

  getValue(): T {
    return this._value;
  }

  get value(): T {
    return this._value;
  }

  _subscribe(subscriber: Subscriber<any>): Subscription<T> {
    const subscription = super._subscribe(subscriber);
    if (!subscription) {
      return;
    } else if (!subscription.isUnsubscribed) {
      subscriber.next(this._value);
    }
    return subscription;
  }

  _next(value: T): void {
    super._next(this._value = value);
  }
}