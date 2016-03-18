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
    // Check `_unsubscribe`to avoid override `this._unsubscribe` accidentally.
    // Dn't call `super(_unsubscribe)` from a derived class.
    if (!!_unsubscribe) {
      (<any> this)._unsubscribe = _unsubscribe;
    }
  }

  unsubscribe(): void {
    if (this.isUnsubscribed) {
      return;
    }
    this.isUnsubscribed = true;

    const result: {
      hasErrors: boolean;
      errors: any[];
    } = {
      hasErrors: false,
      errors: [],
    };

    const { _unsubscribe, _subscriptions }: {
      _unsubscribe: () => void;
      _subscriptions: Subscription[];
    } = (<any> this);

    (<any> this)._subscriptions = null;

    if (isFunction(_unsubscribe)) {
      callPrivateUnsubscribe(this, result);
    }

    if (isArray(_subscriptions)) {

      let index = -1;
      const len = _subscriptions.length;

      while (++index < len) {
        const sub: Subscription = _subscriptions[index];
        if (isObject(sub)) {
          callPublicUnsubscribe(sub, result);
        }
      }
    }

    if (result.hasErrors) {
      throw new UnsubscriptionError(result.errors);
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

export class UnsubscriptionError extends Error {
  constructor(public errors: any[]) {
    super('unsubscriptoin error(s)');
    this.name = 'UnsubscriptionError';
  }
}

function callPrivateUnsubscribe(sub: Subscription, result: { hasErrors: boolean; errors: any[]; }): void {
  try {
    (<any>sub)._unsubscribe();
  }
  catch (e) {
    result.hasErrors = true;
    result.errors.push(e);
  }
}

function callPublicUnsubscribe(sub: Subscription, result: { hasErrors: boolean; errors: any[]; }): void {
  try {
    sub.unsubscribe();
  }
  catch (e) {
    result.hasErrors = true;
    if (e instanceof UnsubscriptionError) {
      result.errors = result.errors.concat(e);
    } else {
      result.errors.push(e);
    }
  }
}