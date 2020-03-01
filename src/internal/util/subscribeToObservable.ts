import { Subscriber } from '../Subscriber';
import { observable as Symbol_observable } from '../symbol/observable';

/**
 * Subscribes to an object that implements Symbol.observable with the given
 * Subscriber.
 * @param obj An object that implements Symbol.observable
 */
export const subscribeToObservable = <T>(obj: any) => (subscriber: Subscriber<T>) => {
  const obs = (obj as any)[Symbol_observable]();
  if (typeof obs.subscribe !== 'function') {
    // Should be caught by observable subscribe function error handling.
    throw new TypeError('Provided object does not correctly implement Symbol.observable');
  } else {
    const subscription = obs.subscribe(subscriber);
    // With observables internal to this package, the returned subscription
    // will be the subscriber that was passed to the subscribe call. Ensure
    // that the interop behaviour is the same - that the passed-in subscriber
    // is returned from this function - and if the received subscription is not
    // the subscriber that was passed in, add it to ensure that unsubscription
    // is correctly chained.
    if (subscription !== subscriber) {
      subscriber.add(subscription);
    }
    return subscriber;
  }
};
