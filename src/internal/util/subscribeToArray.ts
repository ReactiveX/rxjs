import { Subscriber } from '../Subscriber';

/**
 * Subscribes to an ArrayLike with a subscriber
 * @param array The array or array-like to subscribe to
 * @param subscriber
 */
export function subscribeToArray<T>(array: ArrayLike<T>, subscriber: Subscriber<T>) {
  // Loop over the array and emit each value. Note two things here:
  // 1. We're making sure that the subscriber is not closed on each loop.
  //    This is so we don't continue looping over a very large array after
  //    something like a `take`, `takeWhile`, or other synchronous unsubscription
  //    has already unsubscribed.
  // 2. In this form, reentrant code can alter that array we're looping over.
  //    This is a known issue, but considered an edge case. The alternative would
  //    be to copy the array before executing the loop, but this has
  //    performance implications.
  const length = array.length;
  for (let i = 0; i < length && !subscriber.closed; i++) {
    subscriber.next(array[i]);
  }
  subscriber.complete();
}
