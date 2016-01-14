import {isArray} from './util/isArray';
import {isObject} from './util/isObject';
import {isFunction} from './util/isFunction';

export class Subscription {
  public static EMPTY: Subscription = (function(empty: any){
    empty.isUnsubscribed = true;
    return empty;
  }(new Subscription()));

  public isUnsubscribed: boolean = false;

  constructor(_unsubscribe?: () => void) {
    if (_unsubscribe) {
      (<any> this)._unsubscribe = _unsubscribe;
    }
  }

  unsubscribe(): void {

    if (this.isUnsubscribed) {
      return;
    }

    this.isUnsubscribed = true;

    const { _unsubscribe, _subscriptions } = (<any> this);

    (<any> this)._subscriptions = null;

    if (isFunction(_unsubscribe)) {
      _unsubscribe.call(this);
    }

    if (isArray(_subscriptions)) {

      let index = -1;
      const len = _subscriptions.length;

      while (++index < len) {
        const subscription = _subscriptions[index];
        if (isObject(subscription)) {
          subscription.unsubscribe();
        }
      }
    }
  }

  add(subscription: Subscription | Function | void): void {
    // return early if:
    //  1. the subscription is null
    //  2. we're attempting to add our this
    //  3. we're attempting to add the static `empty` Subscription
    if (!subscription || (
        subscription === this) || (
        subscription === Subscription.EMPTY)) {
      return;
    }

    let sub = (<Subscription> subscription);

    switch (typeof subscription) {
      case 'function':
        sub = new Subscription(<(() => void) > subscription);
      case 'object':
        if (sub.isUnsubscribed || typeof sub.unsubscribe !== 'function') {
          break;
        } else if (this.isUnsubscribed) {
            sub.unsubscribe();
        } else {
          ((<any> this)._subscriptions || ((<any> this)._subscriptions = [])).push(sub);
        }
        break;
      default:
        throw new Error('Unrecognized subscription ' + subscription + ' added to Subscription.');
    }
  }

  remove(subscription: Subscription): void {

    // return early if:
    //  1. the subscription is null
    //  2. we're attempting to remove ourthis
    //  3. we're attempting to remove the static `empty` Subscription
    if (subscription == null   || (
        subscription === this) || (
        subscription === Subscription.EMPTY)) {
      return;
    }

    const subscriptions = (<any> this)._subscriptions;

    if (subscriptions) {
      const subscriptionIndex = subscriptions.indexOf(subscription);
      if (subscriptionIndex !== -1) {
        subscriptions.splice(subscriptionIndex, 1);
      }
    }
  }
}
