import { isFunction } from './util/isFunction';
import { Observer, ObservableNotification } from './types';
import { Subscription } from './Subscription';
import { config } from './config';
import { reportUnhandledError } from './util/reportUnhandledError';
import { nextNotification, errorNotification, COMPLETE_NOTIFICATION } from './NotificationFactories';
import { timeoutProvider } from './scheduler/timeoutProvider';

/**
 * Implements the {@link Observer} interface and extends the
 * {@link Subscription} class. While the {@link Observer} is the public API for
 * consuming the values of an {@link Observable}, all Observers get converted to
 * a Subscriber, in order to provide Subscription-like capabilities such as
 * `unsubscribe`. Subscriber is a common type in RxJS, and crucial for
 * implementing operators, but it is rarely used as a public API.
 */
export class Subscriber<T> extends Subscription implements Observer<T> {
  /** @internal */
  protected isStopped: boolean = false;
  /** @internal */
  protected destination: Observer<T>;

  /**
   * Creates an instance of an RxJS Subscriber. This is the workhorse of the library.
   *
   * If another instance of Subscriber is passed in, it will automatically wire up unsubscription
   * between this instnace and the passed in instance.
   *
   * If a partial or full observer is passed in, it will be wrapped and appropriate safeguards will be applied.
   *
   * If a next-handler function is passed in, it will be wrapped and appropriate safeguards will be applied.
   *
   * @param destination A subscriber, partial observer, or function that receives the next value.
   */
  constructor(destination?: Subscriber<T> | Partial<Observer<T>> | ((value: T) => void) | null) {
    super();
    // The only way we know that error reporting safety has been applied is if we own it.
    this.destination = destination instanceof Subscriber ? destination : createSafeObserver(destination);

    // Automatically chain subscriptions together here.
    // if destination appears to be one of our subscriptions, we'll chain it.
    if (hasAddAndUnsubscribe(destination)) {
      destination.add(this);
    }
  }

  /**
   * The {@link Observer} callback to receive notifications of type `next` from
   * the Observable, with a value. The Observable may call this method 0 or more
   * times.
   * @param value The `next` value.
   */
  next(value?: T): void {
    if (this.isStopped) {
      handleStoppedNotification(nextNotification(value), this);
    } else {
      this._next(value!);
    }
  }

  /**
   * The {@link Observer} callback to receive notifications of type `error` from
   * the Observable, with an attached `Error`. Notifies the Observer that
   * the Observable has experienced an error condition.
   * @param err The `error` exception.
   */
  error(err?: any): void {
    if (this.isStopped) {
      handleStoppedNotification(errorNotification(err), this);
    } else {
      this.isStopped = true;
      this._error(err);
    }
  }

  /**
   * The {@link Observer} callback to receive a valueless notification of type
   * `complete` from the Observable. Notifies the Observer that the Observable
   * has finished sending push-based notifications.
   */
  complete(): void {
    if (this.isStopped) {
      handleStoppedNotification(COMPLETE_NOTIFICATION, this);
    } else {
      this.isStopped = true;
      this._complete();
    }
  }

  unsubscribe(): void {
    if (!this.closed) {
      this.isStopped = true;
      super.unsubscribe();
      this.destination = null!;
    }
  }

  protected _next(value: T): void {
    this.destination.next(value);
  }

  protected _error(err: any): void {
    try {
      this.destination.error(err);
    } finally {
      this.unsubscribe();
    }
  }

  protected _complete(): void {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  }
}

class ConsumerObserver<T> implements Observer<T> {
  constructor(private partialObserver: Partial<Observer<T>>) {}

  next(value: T): void {
    const { partialObserver } = this;
    if (partialObserver.next) {
      try {
        partialObserver.next(value);
      } catch (error) {
        reportUnhandledError(error);
      }
    }
  }

  error(err: any): void {
    const { partialObserver } = this;
    if (partialObserver.error) {
      try {
        partialObserver.error(err);
      } catch (error) {
        reportUnhandledError(error);
      }
    } else {
      reportUnhandledError(err);
    }
  }

  complete(): void {
    const { partialObserver } = this;
    if (partialObserver.complete) {
      try {
        partialObserver.complete();
      } catch (error) {
        reportUnhandledError(error);
      }
    }
  }
}

function createSafeObserver<T>(observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null): Observer<T> {
  return new ConsumerObserver(!observerOrNext || isFunction(observerOrNext) ? { next: observerOrNext ?? undefined } : observerOrNext);
}

/**
 * A handler for notifications that cannot be sent to a stopped subscriber.
 * @param notification The notification being sent.
 * @param subscriber The stopped subscriber.
 */
function handleStoppedNotification(notification: ObservableNotification<any>, subscriber: Subscriber<any>) {
  const { onStoppedNotification } = config;
  onStoppedNotification && timeoutProvider.setTimeout(() => onStoppedNotification(notification, subscriber));
}

function hasAddAndUnsubscribe(value: any): value is Subscription {
  return value && isFunction(value.unsubscribe) && isFunction(value.add);
}
