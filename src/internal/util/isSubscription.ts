import { Subscription } from '../Subscription';

/**
 * Tests to see if a value is an RxJS {@link Subscription}.
 * @param x the value to test
 */
export function isSubscription(x: any): x is Subscription {
  return x && typeof x.unsubscribe === 'function' && typeof x.add === 'function';
}
