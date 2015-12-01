import {Subject} from '../Subject';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';

export class AsyncSubject<T> extends Subject<T> {
  _value: T = void 0;
  _hasNext: boolean = false;
  _isScalar: boolean = false;

  constructor () {
    super();
  }

  _subscribe(subscriber: Subscriber<any>): Subscription<T> {
    const subscription = super._subscribe(subscriber);
    if (!subscription) {
      return;
    } else if (!subscription.isUnsubscribed && this._hasNext) {
      subscriber.next(this._value);
      subscriber.complete();
    }
    return subscription;
  }

  _next(value: T): void {
    this._value = value;
    this._hasNext = true;
  }

  _complete(): void {
    let index = -1;
    const observers = this.observers;
    const len = observers.length;

    // optimization -- block next, complete, and unsubscribe while dispatching
    this.observers = void 0; // optimization
    this.isUnsubscribed = true;

    if (this._hasNext) {
      while (++index < len) {
        let o = observers[index];
        o.next(this._value);
        o.complete();
      }
    } else {
      while (++index < len) {
        observers[index].complete();
      }
    }

    this.isUnsubscribed = false;
  }
}
