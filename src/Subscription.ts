import {isArray} from './util/isArray';
import {isObject} from './util/isObject';
import {isFunction} from './util/isFunction';

export interface AnonymousSubscription {
  unsubscribe(): void;
}

export type TeardownLogic = AnonymousSubscription | Function | void;

export interface ISubscription extends AnonymousSubscription {
  unsubscribe(): void;
  isUnsubscribed: boolean;
  add(teardown: TeardownLogic): ISubscription;
  remove(sub: ISubscription): void;
}

export class Subscription implements ISubscription {
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

  /**
   * Adds a tear down to be called during the unsubscribe() of this subscription.
   *
   * If the tear down being added is a subscription that is already unsubscribed,
   * is the same reference `add` is being called on, or is `Subscription.EMPTY`,
   * it will not be added.
   *
   * If this subscription is already in an `isUnsubscribed` state, the passed tear down logic
   * will be executed immediately
   *
   * @param {TeardownLogic} teardown the additional logic to execute on teardown.
   * @returns {Subscription} returns the subscription used or created to be added to the inner
   *  subscriptions list. This subscription can be used with `remove()` to remove the passed teardown
   *  logic from the inner subscriptions list.
   */
  add(teardown: TeardownLogic): Subscription {
    if (!teardown || (
        teardown === this) || (
        teardown === Subscription.EMPTY)) {
      return;
    }

    let sub = (<Subscription> teardown);

    switch (typeof teardown) {
      case 'function':
        sub = new Subscription(<(() => void) > teardown);
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
        throw new Error('Unrecognized teardown ' + teardown + ' added to Subscription.');
    }

    return sub;
  }

  /**
   * removes a subscription from the internal list of subscriptions that will unsubscribe
   * during unsubscribe process of this subscription.
   * @param {Subscription} subscription the subscription to remove
   */
  remove(subscription: Subscription): void {

    // HACK: This might be redundant because of the logic in `add()`
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