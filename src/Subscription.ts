import { isArray } from './util/isArray';
import { isObject } from './util/isObject';
import { isFunction } from './util/isFunction';
import { tryCatch } from './util/tryCatch';
import { errorObject } from './util/errorObject';
import { UnsubscriptionError } from './util/UnsubscriptionError';

export interface AnonymousSubscription {
  unsubscribe(): void;
}

export type TeardownLogic = AnonymousSubscription | Function | void;

export interface ISubscription extends AnonymousSubscription {
  unsubscribe(): void;
  closed: boolean;
}

/**
 * Represents a disposable resource, such as the execution of an Observable. A
 * Subscription has one important method, `unsubscribe`, that takes no argument
 * and just disposes the resource held by the subscription.
 *
 * Additionally, subscriptions may be grouped together through the `add()`
 * method, which will attach a child Subscription to the current Subscription.
 * When a Subscription is unsubscribed, all its children (and its grandchildren)
 * will be unsubscribed as well.
 *
 * @class Subscription
 */
export class Subscription implements ISubscription {
  public static EMPTY: Subscription = (function(empty: any){
    empty.closed = true;
    return empty;
  }(new Subscription()));

  /**
   * A flag to indicate whether this Subscription has already been unsubscribed.
   * @type {boolean}
   */
  public closed: boolean = false;

  /**
   * @param {function(): void} [unsubscribe] A function describing how to
   * perform the disposal of resources when the `unsubscribe` method is called.
   */
  constructor(unsubscribe?: () => void) {
    if (unsubscribe) {
      (<any> this)._unsubscribe = unsubscribe;
    }
  }

  /**
   * Disposes the resources held by the subscription. May, for instance, cancel
   * an ongoing Observable execution or cancel any other type of work that
   * started when the Subscription was created.
   * @return {void}
   */
  unsubscribe(): void {
    let hasErrors = false;
    let errors: any[];

    if (this.closed) {
      return;
    }

    this.closed = true;

    const { _unsubscribe, _subscriptions } = (<any> this);

    (<any> this)._subscriptions = null;

    if (isFunction(_unsubscribe)) {
      let trial = tryCatch(_unsubscribe).call(this);
      if (trial === errorObject) {
        hasErrors = true;
        (errors = errors || []).push(errorObject.e);
      }
    }

    if (isArray(_subscriptions)) {

      let index = -1;
      const len = _subscriptions.length;

      while (++index < len) {
        const sub = _subscriptions[index];
        if (isObject(sub)) {
          let trial = tryCatch(sub.unsubscribe).call(sub);
          if (trial === errorObject) {
            hasErrors = true;
            errors = errors || [];
            let err = errorObject.e;
            if (err instanceof UnsubscriptionError) {
              errors = errors.concat(err.errors);
            } else {
              errors.push(err);
            }
          }
        }
      }
    }

    if (hasErrors) {
      throw new UnsubscriptionError(errors);
    }
  }

  /**
   * Adds a tear down to be called during the unsubscribe() of this
   * Subscription.
   *
   * If the tear down being added is a subscription that is already
   * unsubscribed, is the same reference `add` is being called on, or is
   * `Subscription.EMPTY`, it will not be added.
   *
   * If this subscription is already in an `closed` state, the passed
   * tear down logic will be executed immediately.
   *
   * @param {TeardownLogic} teardown The additional logic to execute on
   * teardown.
   * @return {Subscription} Returns the Subscription used or created to be
   * added to the inner subscriptions list. This Subscription can be used with
   * `remove()` to remove the passed teardown logic from the inner subscriptions
   * list.
   */
  add(teardown: TeardownLogic): Subscription {
    if (!teardown || (teardown === Subscription.EMPTY)) {
      return Subscription.EMPTY;
    }

    if (teardown === this) {
      return this;
    }

    let sub = (<Subscription> teardown);

    switch (typeof teardown) {
      case 'function':
        sub = new Subscription(<(() => void) > teardown);
      case 'object':
        if (sub.closed || typeof sub.unsubscribe !== 'function') {
          break;
        } else if (this.closed) {
          sub.unsubscribe();
        } else {
          ((<any> this)._subscriptions || ((<any> this)._subscriptions = [])).push(sub);
        }
        break;
      default:
        throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
    }

    return sub;
  }

  /**
   * Removes a Subscription from the internal list of subscriptions that will
   * unsubscribe during the unsubscribe process of this Subscription.
   * @param {Subscription} subscription The subscription to remove.
   * @return {void}
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
