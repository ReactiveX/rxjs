import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';

/**
 * Subscribes a subscriber to an observable and ensures the subscriber is
 * returned as the subscription.
 *
 * When an instance of a subscriber from within this package is passed to the
 * subscribe method of an observable from within this package, the returned
 * subscription is the subscriber instance.
 *
 * Operator implementations depend upon this behaviour, so it's important
 * that interop subscribers and observables behave in a similar manner. If
 * they do not, unsubscription chains can be broken.
 *
 * This function ensures that if the subscription returned from the subscribe
 * call is not the subscriber itself, the subscription is added to the
 * subscriber and the subscriber is returned. Doing so will ensure that the
 * unsubscription chain is not broken.
 *
 * This function needs to be used wherever an interop observable or
 * subscriber could be encountered. There are two such places:
 * - within `subscribeToObservable`; and
 * - within the `call` method of each operator's `Operator` class.
 *
 * Within `subscribeToObservable` the observables are almost always going to
 * be interop - as they're obtained via the `Symbol.observable` property.
 *
 * Within the `call` method, the operator's subscriber will be interop -
 * relative to the source observable - if the operator is imported from a
 * package that uses a different version of RxJS.
 *
 * @param observable the observable to subscribe to
 * @param subscriber the subscriber to be subscribed
 * @returns the passed-in subscriber (as the subscription)
 */
export function subscribeWith<T>(
  observable: Observable<T>,
  subscriber: Subscriber<T>
): Subscription {
  const subscription = observable.subscribe(subscriber);
  if (subscription !== subscriber) {
    subscriber.add(subscription);
  }
  return subscriber;
}