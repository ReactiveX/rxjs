import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';

/**
 * Subscribes an operator's subscriber to its source and ensures that
 * unsubscription is chained for interop operators.
 */
export function subscribeAndChainOperator<T>(
  subscriber: Subscriber<T>,
  source: Observable<T>
): Subscription {
  const subscription = source.subscribe(subscriber);
  // The returned subscription will usually be the operator's subscriber.
  // However, interop subscribers will be wrapped and for
  // unsubscriptions to chain correctly, the wrapper needs to be added, too.
  if (subscription !== subscriber) {
    subscription.add(subscriber);
  }
  return subscription;
}
