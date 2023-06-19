import { isFunction } from './util/isFunction';
import { Observer, ObservableNotification } from './types';
import { Subscription } from './Subscription';
import { config } from './config';
import { reportUnhandledError } from './util/reportUnhandledError';
import { nextNotification, errorNotification, COMPLETE_NOTIFICATION } from './NotificationFactories';
import { timeoutProvider } from './scheduler/timeoutProvider';

export interface SubscriberOverrides<T> {
  /**
   * If provided, this function will be called whenever the {@link Subscriber}'s
   * `next` method is called, with the value that was passed to that call. If
   * an error is thrown within this function, it will be handled and passed to
   * the destination's `error` method.
   * @param value The value that is being observed from the source.
   */
  next?: (value: T) => void;
  /**
   * If provided, this function will be called whenever the {@link Subscriber}'s
   * `error` method is called, with the error that was passed to that call. If
   * an error is thrown within this function, it will be handled and passed to
   * the destination's `error` method.
   * @param err An error that has been thrown by the source observable.
   */
  error?: (err: any) => void;
  /**
   * If provided, this function will be called whenever the {@link Subscriber}'s
   * `complete` method is called. If an error is thrown within this function, it
   * will be handled and passed to the destination's `error` method.
   */
  complete?: () => void;
  /**
   * If provided, this function will be called after all teardown has occurred
   * for this {@link Subscriber}. This is generally used for cleanup purposes
   * during operator development.
   */
  finalize?: () => void;
}

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

  /** @internal */
  protected readonly _nextOverride: ((value: T) => void) | null = null;
  /** @internal */
  protected readonly _errorOverride: ((err: any) => void) | null = null;
  /** @internal */
  protected readonly _completeOverride: (() => void) | null = null;
  /** @internal */
  protected readonly _onFinalize: (() => void) | null = null;

  /**
   * @deprecated Do not create instances of `Subscriber` directly. Use {@link operate} instead.
   */
  constructor(destination?: Subscriber<T> | Partial<Observer<T>> | ((value: T) => void) | null);

  /**
   * @internal
   */
  constructor(destination: Subscriber<any> | Partial<Observer<any>> | ((value: any) => void) | null, overrides: SubscriberOverrides<T>);

  /**
   * Creates an instance of an RxJS Subscriber. This is the workhorse of the library.
   *
   * If another instance of Subscriber is passed in, it will automatically wire up unsubscription
   * between this instance and the passed in instance.
   *
   * If a partial or full observer is passed in, it will be wrapped and appropriate safeguards will be applied.
   *
   * If a next-handler function is passed in, it will be wrapped and appropriate safeguards will be applied.
   *
   * @param destination A subscriber, partial observer, or function that receives the next value.
   * @deprecated Do not create instances of `Subscriber` directly. Use {@link operate} instead.
   */
  constructor(destination?: Subscriber<T> | Partial<Observer<T>> | ((value: T) => void) | null, overrides?: SubscriberOverrides<T>) {
    super();

    // The only way we know that error reporting safety has been applied is if we own it.
    this.destination = destination instanceof Subscriber ? destination : createSafeObserver(destination);

    this._nextOverride = overrides?.next ?? null;
    this._errorOverride = overrides?.error ?? null;
    this._completeOverride = overrides?.complete ?? null;
    this._onFinalize = overrides?.finalize ?? null;

    // It's important - for performance reasons - that all of this class's
    // members are initialized and that they are always initialized in the same
    // order. This will ensure that all Subscriber instances have the
    // same hidden class in V8. This, in turn, will help keep the number of
    // hidden classes involved in property accesses within the base class as
    // low as possible. If the number of hidden classes involved exceeds four,
    // the property accesses will become megamorphic and performance penalties
    // will be incurred - i.e. inline caches won't be used.
    //
    // The reasons for ensuring all instances have the same hidden class are
    // further discussed in this blog post from Benedikt Meurer:
    // https://benediktmeurer.de/2018/03/23/impact-of-polymorphism-on-component-based-frameworks-like-react/
    this._next = this._nextOverride ? overrideNext : this._next;
    this._error = this._errorOverride ? overrideError : this._error;
    this._complete = this._completeOverride ? overrideComplete : this._complete;

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
  next(value: T): void {
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
      this._onFinalize?.();
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

function overrideNext<T>(this: Subscriber<T>, value: T): void {
  try {
    this._nextOverride!(value);
  } catch (error) {
    this.destination.error(error);
  }
}

function overrideError(this: Subscriber<unknown>, err: any): void {
  try {
    this._errorOverride!(err);
  } catch (error) {
    this.destination.error(error);
  } finally {
    this.unsubscribe();
  }
}

function overrideComplete(this: Subscriber<unknown>): void {
  try {
    this._completeOverride!();
  } catch (error) {
    this.destination.error(error);
  } finally {
    this.unsubscribe();
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

export interface OperateConfig<In, Out> extends SubscriberOverrides<In> {
  /**
   * The destination subscriber to forward notifications to. This is also the
   * subscriber that will receive unhandled errors if your `next`, `error`, or `complete`
   * overrides throw.
   */
  destination: Subscriber<Out>;
}

/**
 * Creates a new {@link Subscriber} instance that passes notifications on to the
 * supplied `destination`. The overrides provided in the `config` argument for
 * `next`, `error`, and `complete` will be called in such a way that any
 * errors are caught and forwarded to the destination's `error` handler. The returned
 * `Subscriber` will be "chained" to the `destination` such that when `unsubscribe` is
 * called on the `destination`, the returned `Subscriber` will also be unsubscribed.
 *
 * Advanced: This ensures that subscriptions are properly wired up prior to starting the
 * subcription logic. This prevents "synchronous firehose" scenarios where an
 * inner observable from a flattening operation cannot be stopped by a downstream
 * terminal operator like `take`.
 *
 * This is a utility designed to be used to create new operators for observables.
 *
 * For examples, please see our code base.
 *
 * @param config The configuration for creating a new subscriber for an operator.
 * @returns A new subscriber that is chained to the destination.
 */
export function operate<In, Out>({ destination, ...subscriberOverrides }: OperateConfig<In, Out>) {
  return new Subscriber(destination, subscriberOverrides);
}
