/** @prettier */

import { ObservableInput } from '../types';
import { Subject } from '../Subject';
import { Subscription } from '../Subscription';
import { Observable } from '../Observable';
import { defer } from './defer';

/**
 * An observable with a `connect` method that is used to create a subscription
 * to an underlying source, connecting it with all consumers via a multicast.
 */
export interface ConnectableObservableLike<T> extends Observable<T> {
  /**
   * (Idempotent) Calling this method will connect the underlying source observable to all subscribed consumers
   * through an underlying {@link Subject}.
   * @returns A subscription, that when unsubscribed, will "disconnect" the source from the connector subject,
   * severing notifications to all consumers.
   */
  connect(): Subscription;
}

/**
 * Creates an observable that multicasts once `connect()` is called on it.
 *
 * @param source The observable source to make connectable.
 * @param connector The subject to used to multicast the source observable to all subscribers.
 * Defaults to a new {@link Subject}.
 * @returns A "connectable" observable, that has a `connect()` method, that you must call to
 * connect the source to all consumers through the subject provided as the connector.
 */
export function connectable<T>(source: ObservableInput<T>, connector: Subject<T> = new Subject<T>()): ConnectableObservableLike<T> {
  // The subscription representing the connection.
  let connection: Subscription | null = null;

  const result: any = new Observable<T>((subscriber) => {
    return connector.subscribe(subscriber);
  });

  // Define the `connect` function. This is what users must call
  // in order to "connect" the source to the subject that is
  // multicasting it.
  result.connect = () => {
    if (!connection) {
      connection = defer(() => source).subscribe(connector);
    }
    return connection;
  };

  return result;
}
