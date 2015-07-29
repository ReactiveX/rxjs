import noop from './util/noop';
import throwError from './util/throwError';
import tryOrOnError from './util/tryOrOnError';

import Observer from './Observer';
import Subscription from './Subscription';

const subscriptionAdd = Subscription.prototype.add;
const subscriptionRemove = Subscription.prototype.remove;
const subscriptionUnsubscribe = Subscription.prototype.unsubscribe;

export default class Subscriber<T> extends Observer<T> implements Subscription<T> {

  static create<T>(next    ?: (x?) => void,
                   error   ?: (e?) => void,
                   complete?: () => void): Subscriber<T> {
    const subscriber = new Subscriber<T>();
    subscriber._next = (typeof next === "function") && tryOrOnError(next) || noop;
    subscriber._error = (typeof error === "function") && error || throwError;
    subscriber._complete = (typeof complete === "function") && complete || noop;
    return subscriber;
  }

  _subscription: Subscription<T>;
  _isUnsubscribed: boolean = false;

  constructor(destination?: Observer<any>) {
    super(destination);
    if (!destination) {
      return;
    }
    const subscription = (<any> destination)._subscription;
    if (subscription) {
      this._subscription = subscription;
    } else if (destination instanceof Subscriber) {
      this._subscription = (<Subscription<T>> destination);
    }
  }

  get isUnsubscribed(): boolean {
    const subscription = this._subscription;
    if (subscription) {
      // route to the shared Subscription if it exists
      return this._isUnsubscribed || subscription.isUnsubscribed;
    } else {
      return this._isUnsubscribed;
    }
  }

  set isUnsubscribed(value: boolean) {
    const subscription = this._subscription;
    if (subscription) {
      // route to the shared Subscription if it exists
      subscription.isUnsubscribed = value;
    } else {
      this._isUnsubscribed = value;
    }
  }

  add(sub?) {
    // route add to the shared Subscription if it exists
    subscriptionAdd.call(this._subscription || this, sub);
  }

  remove(sub?) {
    // route remove to the shared Subscription if it exists
    subscriptionRemove.call(this._subscription || this, sub);
  }

  unsubscribe() {
    if(this._isUnsubscribed) {
      return;
    } else if(this._subscription) {
      this._isUnsubscribed = true;
    } else  {
      subscriptionUnsubscribe.call(this);
    }
  }

  next(value?) {
    if (!this.isUnsubscribed) {
      this._next(value);
    }
  }

  error(error?) {
    if (!this.isUnsubscribed) {
      this._error(error);
      this.unsubscribe();
    }
  }

  complete() {
    if (!this.isUnsubscribed) {
      this._complete();
      this.unsubscribe();
    }
  }
}
