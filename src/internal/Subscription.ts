/** @prettier */
import { isArray } from './util/isArray';
import { isObject } from './util/isObject';
import { isFunction } from './util/isFunction';
import { UnsubscriptionError } from './util/UnsubscriptionError';
import { SubscriptionLike, TeardownLogic } from './types';

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
export class Subscription implements SubscriptionLike {
  /** @nocollapse */
  public static EMPTY: Subscription = (function (empty: any) {
    empty.closed = true;
    return empty;
  })(new Subscription());

  /**
   * A flag to indicate whether this Subscription has already been unsubscribed.
   */
  public closed = false;

  /** If this subscription has been added to one parent, it will show up here */
  private _singleParent?: Subscription;

  /** If this subscription has been added to more than one parent, they will show up here. */
  private _parents?: Subscription[];

  /**
   * The list of registered teardowns to execute upon unsubscription. Adding and removing from this
   * list occurs in the {@link add} and {@link remove} methods.
   */
  private _teardowns?: Exclude<TeardownLogic, void>[];

  /**
   * @param {function(): void} [unsubscribe] A function describing how to
   * perform the disposal of resources when the `unsubscribe` method is called.
   */
  constructor(unsubscribe?: () => void) {
    if (unsubscribe) {
      (this as any)._ctorUnsubscribe = true;
      (this as any)._unsubscribe = unsubscribe;
    }
  }

  /**
   * Disposes the resources held by the subscription. May, for instance, cancel
   * an ongoing Observable execution or cancel any other type of work that
   * started when the Subscription was created.
   * @return {void}
   */
  unsubscribe(): void {
    let errors: any[] | undefined;

    if (!this.closed) {
      this.closed = true;

      const { _parents, _singleParent, _teardowns } = this;
      this._parents = this._singleParent = this._teardowns = undefined;
      let { _ctorUnsubscribe, _unsubscribe } = this as any;
      // (this as any)._unsubscribe = (this as any)._ctorUnsubscribe = undefined;

      // Remove this from it's parents.
      if (_singleParent) {
        this._singleParent = undefined;
        _singleParent.remove(this);
      }

      if (_parents) {
        this._parents = undefined;
        for (const parent of _parents) {
          parent.remove(this);
        }
      }

      if (isFunction(_unsubscribe)) {
        // It's only possible to null _unsubscribe - to release the reference to
        // any teardown function passed in the constructor - if the property was
        // actually assigned in the constructor, as there are some classes that
        // are derived from Subscriber (which derives from Subscription) that
        // implement an _unsubscribe method as a mechanism for obtaining
        // unsubscription notifications and some of those subscribers are
        // recycled. Also, in some of those subscribers, _unsubscribe switches
        // from a prototype method to an instance property - see notifyNext in
        // RetryWhenSubscriber.
        if (_ctorUnsubscribe) {
          (this as any)._unsubscribe = undefined;
        }
        try {
          _unsubscribe.call(this);
        } catch (e) {
          errors = e instanceof UnsubscriptionError ? e.errors : [e];
        }
      }

      if (_teardowns) {
        for (const teardown of _teardowns) {
          try {
            if (typeof teardown === 'function') {
              teardown();
            } else {
              teardown.unsubscribe();
            }
          } catch (err) {
            errors = errors ?? [];
            if (err instanceof UnsubscriptionError) {
              errors = [...errors, ...err.errors];
            } else {
              errors.push(err);
            }
          }
        }
      }

      if (errors) {
        throw new UnsubscriptionError(errors);
      }
    }
  }

  /**
   * Adds a teardown to this subscription, so that teardown will be unsubscribed/called
   * when this subscription is unsubscribed. If this subscription is already {@link closed},
   * because it has already been unsubscribed, then whatever teardown is passed to it
   * will automatically be executed (unless the teardown itself is also a closed subscription).
   *
   * Closed Subscriptions cannot be added as teardowns to any subscription. Adding a closed
   * subscription to a any subscription will result in no operation. (A noop).
   *
   * Adding a subscription to itself, or adding `null` or `undefined` will not perform any
   * operation at all. (A noop).
   *
   * `Subscription` instances that are added to this instance will automatically remove themselves
   * if they are unsubscribed. Functions and {@link Unsubscribable} objects that you wish to remove
   * will need to be removed manually with {@link remove}
   *
   * @param teardown The teardown logic to add to this subscription.
   */
  add(teardown: TeardownLogic): void {
    // Only add the teardown if it's not undefined
    // and don't add a subscription to itself.
    if (teardown && teardown !== this) {
      if (this.closed) {
        // If this subscription is already closed,
        // execute whatever teardown is handed to it automatically.
        if (typeof teardown === 'function') {
          teardown();
        } else {
          teardown.unsubscribe();
        }
      } else {
        this._teardowns = this._teardowns ?? [];
        if (teardown instanceof Subscription) {
          // We don't add closed subscriptions, and we don't add the same subscription
          // twice. Subscription unsubscribe is idempotent.
          if (teardown.closed || teardown._hasParent(this)) {
            return;
          }
          teardown._addParent(this);
        }
        this._teardowns.push(teardown);
      }
    }
  }

  private _hasParent(parent: Subscription) {
    return this._singleParent === parent || this._parents?.includes(parent) || false;
  }

  private _addParent(parent: Subscription) {
    // If we already have one or more parents, we need
    // to add to the list of parents.
    if ((this._parents || this._singleParent) && this._singleParent !== parent) {
      if (this._singleParent) {
        // We are adding our second parent.
        // Move the single parent over to the parents list.
        this._parents = [this._singleParent];
        this._singleParent = undefined;
      }
      if (!this._parents!.includes(parent)) {
        this._parents!.push(parent);
      }
    } else {
      this._singleParent = parent;
    }
  }

  private _removeParent(parent: Subscription) {
    if (this._singleParent) {
      if (this._singleParent === parent) {
        this._singleParent = undefined;
      }
    } else if (this._parents) {
      const index = this._parents.indexOf(parent);
      if (index >= 0) {
        this._parents.splice(index, 1);
      }
    }
  }

  /**
   * Removes a teardown from this subscription that was previously added with the {@link add} method.
   *
   * Note that `Subscription` instances, when unsubscribed, will automatically remove themselves
   * from every other `Subscription` they have been added to. This means that using the `remove` method
   * is not a common thing and should be used thoughtfully.
   *
   * If you add the same teardown instance of a function or an unsubscribable object to a `Subcription` instance
   * more than once, you will need to call `remove` the same number of times to remove all instances.
   *
   * All teardown instances are removed to free up memory upon unsubscription.
   *
   * @param teardown The teardown to remove from this subscription
   */
  remove(teardown: Exclude<TeardownLogic, void>): void {
    const { _teardowns } = this;
    if (_teardowns) {
      const index = _teardowns.indexOf(teardown);
      if (index >= 0) {
        _teardowns.splice(index, 1);
      }
    }

    if (teardown instanceof Subscription) {
      teardown._removeParent(this);
    }
  }
}

export function isSubscription(value: any): value is Subscription {
  return (
    value instanceof Subscription ||
    (value &&
      'closed' in value &&
      typeof value.remove === 'function' &&
      typeof value.add === 'function' &&
      typeof value.unsubscribe === 'function')
  );
}
