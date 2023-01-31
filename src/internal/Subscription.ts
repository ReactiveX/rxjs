import { isFunction } from './util/isFunction';
import { UnsubscriptionError } from './util/UnsubscriptionError';
import { SubscriptionLike, TeardownLogic, Unsubscribable } from './types';

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
  public static EMPTY = (() => {
    const empty = new Subscription();
    empty.closed = true;
    return empty;
  })();

  /**
   * A flag to indicate whether this Subscription has already been unsubscribed.
   */
  public closed = false;

  /**
   * The list of registered finalizers to execute upon unsubscription. Adding and removing from this
   * list occurs in the {@link #add} and {@link #remove} methods.
   */
  private _finalizers: Set<Exclude<TeardownLogic, void>> | null = null;

  /**
   * @param initialTeardown A function executed first as part of the finalization
   * process that is kicked off when {@link #unsubscribe} is called.
   */
  constructor(private initialTeardown?: () => void) {}

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

      const { initialTeardown: initialFinalizer } = this;
      if (isFunction(initialFinalizer)) {
        try {
          initialFinalizer();
        } catch (e) {
          errors = e instanceof UnsubscriptionError ? e.errors : [e];
        }
      }

      const { _finalizers } = this;
      if (_finalizers) {
        this._finalizers = null;
        for (const finalizer of _finalizers) {
          try {
            execFinalizer(finalizer);
          } catch (err) {
            errors = errors ?? [];
            if (err instanceof UnsubscriptionError) {
              errors.push(...err.errors);
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
   * Adds a finalizer to this subscription, so that finalization will be unsubscribed/called
   * when this subscription is unsubscribed. If this subscription is already {@link #closed},
   * because it has already been unsubscribed, then whatever finalizer is passed to it
   * will automatically be executed (unless the finalizer itself is also a closed subscription).
   *
   * Closed Subscriptions cannot be added as finalizers to any subscription. Adding a closed
   * subscription to a any subscription will result in no operation. (A noop).
   *
   * Adding a subscription to itself, or adding `null` or `undefined` will not perform any
   * operation at all. (A noop).
   *
   * `Subscription` instances that are added to this instance will automatically remove themselves
   * if they are unsubscribed. Functions and {@link Unsubscribable} objects that you wish to remove
   * will need to be removed manually with {@link #remove}
   *
   * @param teardown The finalization logic to add to this subscription.
   */
  add(teardown: TeardownLogic): void {
    // Only add the finalizer if it's not undefined
    // and don't add a subscription to itself.
    if (teardown && teardown !== this) {
      if (this.closed) {
        // If this subscription is already closed,
        // execute whatever finalizer is handed to it automatically.
        execFinalizer(teardown);
      } else {
        if (teardown && 'add' in teardown) {
          // If teardown is a subscription, we can make sure that if it
          // unsubscribes first, it removes itself from this subscription.
          teardown.add(() => {
            this.remove(teardown);
          });
        }

        this._finalizers ??= new Set();
        this._finalizers.add(teardown);
      }
    }
  }

  /**
   * Removes a finalizer from this subscription that was previously added with the {@link #add} method.
   *
   * Note that `Subscription` instances, when unsubscribed, will automatically remove themselves
   * from every other `Subscription` they have been added to. This means that using the `remove` method
   * is not a common thing and should be used thoughtfully.
   *
   * If you add the same finalizer instance of a function or an unsubscribable object to a `Subscription` instance
   * more than once, you will need to call `remove` the same number of times to remove all instances.
   *
   * All finalizer instances are removed to free up memory upon unsubscription.
   *
   * TIP: In instances you're adding and removing _Subscriptions from other Subscriptions_, you should
   * be sure to unsubscribe or otherwise get rid of the child subscription reference as soon as you remove it.
   * The child subscription has a reference to the parent it was added to via closure. In most cases, this
   * a non-issue, as child subscriptions are rarely long-lived.
   *
   * @param teardown The finalizer to remove from this subscription
   */
  remove(teardown: Exclude<TeardownLogic, void>): void {
    this._finalizers?.delete(teardown);
  }
}

function execFinalizer(finalizer: Unsubscribable | (() => void)) {
  if (isFunction(finalizer)) {
    finalizer();
  } else {
    finalizer.unsubscribe();
  }
}
