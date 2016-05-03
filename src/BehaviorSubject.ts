import {Subject} from './Subject';
import {Subscriber} from './Subscriber';
import {Subscription, ISubscription} from './Subscription';
import {throwError} from './util/throwError';
import {ObjectUnsubscribedError} from './util/ObjectUnsubscribedError';

/**
 * @class BehaviorSubject<T>
 */
export class BehaviorSubject<T> extends Subject<T> {

  constructor(private _value: T) {
    super();
  }

  getValue(): T {
    if (this.hasError) {
      throwError(this.thrownError);
    } else if (this.isUnsubscribed) {
      throwError(new ObjectUnsubscribedError());
    } else {
      return this._value;
    }
  }

  get value(): T {
    return this.getValue();
  }

  _subscribe(subscriber: Subscriber<T>): Subscription {
    const subscription = super._subscribe(subscriber);
    if (subscription && !(<ISubscription> subscription).isUnsubscribed) {
      subscriber.next(this._value);
    }
    return subscription;
  }

  next(value: T): void {
    super.next(this._value = value);
  }
}
