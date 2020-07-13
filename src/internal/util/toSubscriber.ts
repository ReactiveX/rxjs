/** @prettier */
import { Subscriber } from '../Subscriber';
import { empty as emptyObserver } from '../Observer';
import { PartialObserver, Observer } from '../types';
import { isSubscription } from '../Subscription';

export function toSubscriber<T>(
  nextOrObserver?: PartialObserver<T> | ((value: T) => void) | null,
  error?: ((error: any) => void) | null,
  complete?: (() => void) | null
): Subscriber<T> {
  if (nextOrObserver) {
    if (isSubscriber(nextOrObserver)) {
      return nextOrObserver;
    }

    if (isObserver(nextOrObserver)) {
      return new FullObserverSubscriber(nextOrObserver);
    }
  }

  if (!nextOrObserver && !error && !complete) {
    return new Subscriber(emptyObserver);
  }

  return new Subscriber(nextOrObserver, error, complete);
}

function isObserver<T>(value: any): value is Observer<T> {
  return value && typeof value.next === 'function' && typeof value.error === 'function' && typeof value.complete === 'function';
}

function isSubscriber<T>(value: any): value is Subscriber<T> {
  return value instanceof Subscriber || (isObserver(value) && isSubscription(value));
}

/**
 * Used to wrap objects that we know to be full observers
 * having a `next`, `error`, and `complete` method.
 */
class FullObserverSubscriber<T> extends Subscriber<T> {
  /**
   * Creates an instance of a subscriber
   *
   * NOTE: The `protected destination` is a tricky override of the
   * destination on the original `Subscriber` class. This whole
   * class may look unnecessary, but it's doing this trick to get around
   * some of the ugly inheritance stuff we have going on in the library.
   */
  constructor(protected destination: Observer<T>) {
    super();
  }
}
