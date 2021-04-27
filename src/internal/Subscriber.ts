import { isFunction } from './util/isFunction';
import { Observer, ObservableNotification } from './types';
import { isSubscription, Subscription } from './Subscription';
import { config } from './config';
import { reportUnhandledError } from './util/reportUnhandledError';
import { noop } from './util/noop';
import { nextNotification, errorNotification, COMPLETE_NOTIFICATION } from './NotificationFactories';
import { timeoutProvider } from './scheduler/timeoutProvider';

/**
 * Implements the {@link Observer} interface and extends the
 * {@link Subscription} class. While the {@link Observer} is the public API for
 * consuming the values of an {@link Observable}, all Observers get converted to
 * a Subscriber, in order to provide Subscription-like capabilities such as
 * `unsubscribe`. Subscriber is a common type in RxJS, and crucial for
 * implementing operators, but it is rarely used as a public API.
 *
 * @class Subscriber<T>
 */
export class Subscriber<T> extends Subscription implements Observer<T> {
  /**
   * A static factory for a Subscriber, given a (potentially partial) definition
   * of an Observer.
   * @param next The `next` callback of an Observer.
   * @param error The `error` callback of an
   * Observer.
   * @param complete The `complete` callback of an
   * Observer.
   * @return A Subscriber wrapping the (partially defined)
   * Observer represented by the given arguments.
   * @nocollapse
   * @deprecated Do not use. Will be removed in v8. There is no replacement for this
   * method, and there is no reason to be creating instances of `Subscriber` directly.
   * If you have a specific use case, please file an issue.
   */
  static create<T>(next?: (x?: T) => void, error?: (e?: any) => void, complete?: () => void): Subscriber<T> {
    return new SafeSubscriber(next, error, complete);
  }

  /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
  protected isStopped: boolean = false;
  /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
  protected destination: Subscriber<any> | Observer<any>; // this `any` is the escape hatch to erase extra type param (e.g. R)

  /**
   * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
   * There is no reason to directly create an instance of Subscriber. This type is exported for typings reasons.
   */
  constructor(destination?: Subscriber<any> | Observer<any>) {
    super();
    if (destination) {
      this.destination = destination;
      // Automatically chain subscriptions together here.
      // if destination is a Subscription, then it is a Subscriber.
      if (isSubscription(destination)) {
        destination.add(this);
      }
    } else {
      this.destination = EMPTY_OBSERVER;
    }
  }

  /**
   * The {@link Observer} callback to receive notifications of type `next` from
   * the Observable, with a value. The Observable may call this method 0 or more
   * times.
   * @param {T} [value] The `next` value.
   * @return {void}
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
   * @param {any} [err] The `error` exception.
   * @return {void}
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
   * @return {void}
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

export class SafeSubscriber<T> extends Subscriber<T> {
  constructor(
    observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
    error?: ((e?: any) => void) | null,
    complete?: (() => void) | null
  ) {
    super();

    let next: ((value: T) => void) | undefined;
    if (isFunction(observerOrNext)) {
      // The first argument is a function, not an observer. The next
      // two arguments *could* be observers, or they could be empty.
      next = observerOrNext;
    } else if (observerOrNext) {
      // The first argument is an observer object, we have to pull the handlers
      // off and capture the owner object as the context. That is because we're
      // going to put them all in a new destination with ensured methods
      // for `next`, `error`, and `complete`. That's part of what makes this
      // the "Safe" Subscriber.
      ({ next, error, complete } = observerOrNext);
      let context: any;
      if (this && config.useDeprecatedNextContext) {
        // This is a deprecated path that made `this.unsubscribe()` available in
        // next handler functions passed to subscribe. This only exists behind a flag
        // now, as it is *very* slow.
        context = Object.create(observerOrNext);
        context.unsubscribe = () => this.unsubscribe();
      } else {
        context = observerOrNext;
      }
      next = next?.bind(context);
      error = error?.bind(context);
      complete = complete?.bind(context);
    }

    // Once we set the destination, the superclass `Subscriber` will
    // do it's magic in the `_next`, `_error`, and `_complete` methods.
    this.destination = {
      next: next ? wrapForErrorHandling(next, this) : noop,
      error: wrapForErrorHandling(error ?? defaultErrorHandler, this),
      complete: complete ? wrapForErrorHandling(complete, this) : noop,
    };
  }
}

/**
 * Wraps a user-provided handler (or our {@link defaultErrorHandler} in one case) to
 * ensure that any thrown errors are caught and handled appropriately.
 *
 * @param handler The handler to wrap
 * @param instance The SafeSubscriber instance we're going to mark if there's an error.
 */
function wrapForErrorHandling(handler: (arg?: any) => void, instance: SafeSubscriber<any>) {
  return (...args: any[]) => {
    try {
      handler(...args);
    } catch (err) {
      if (config.useDeprecatedSynchronousErrorHandling) {
        // If the user has opted for "super-gross" mode, we need to check to see
        // if we're currently subscribing. If we are, we need to mark the _syncError
        // So that it can be rethrown in the `subscribe` call on `Observable`.
        if ((instance as any)._syncErrorHack_isSubscribing) {
          (instance as any).__syncError = err;
        } else {
          // We're not currently subscribing, but we're in super-gross mode,
          // so throw it immediately.
          throw err;
        }
      } else {
        // Ideal path, we report this as an unhandled error,
        // which is thrown on a new call stack.
        reportUnhandledError(err);
      }
    }
  };
}
/**
 * An error handler used when no error handler was supplied
 * to the SafeSubscriber -- meaning no error handler was supplied
 * do the `subscribe` call on our observable.
 * @param err The error to handle
 */
function defaultErrorHandler(err: any) {
  throw err;
}

/**
 * A handler for notifications that cannot be sent to a stopped subscriber.
 * @param notification The notification being sent
 * @param subscriber The stopped subscriber
 */
function handleStoppedNotification(notification: ObservableNotification<any>, subscriber: Subscriber<any>) {
  const { onStoppedNotification } = config;
  onStoppedNotification && timeoutProvider.setTimeout(() => onStoppedNotification(notification, subscriber));
}

/**
 * The observer used as a stub for subscriptions where the user did not
 * pass any arguments to `subscribe`. Comes with the default error handling
 * behavior.
 */
export const EMPTY_OBSERVER: Readonly<Observer<any>> & { closed: true } = {
  closed: true,
  next: noop,
  error: defaultErrorHandler,
  complete: noop,
};
