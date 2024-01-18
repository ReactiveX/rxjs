import type {
  TeardownLogic,
  UnaryFunction,
  Subscribable,
  Observer,
  OperatorFunction,
  Unsubscribable,
  SubscriptionLike,
  ObservableNotification,
  ObservableInput,
  ObservedValueOf,
  ReadableStreamLike,
  InteropObservable,
  CompleteNotification,
  ErrorNotification,
  NextNotification,
} from './types.js';

/**
 * An error thrown when one or more errors have occurred during the
 * `unsubscribe` of a {@link Subscription}.
 */
export class UnsubscriptionError extends Error {
  /**
   * @deprecated Internal implementation detail. Do not construct error instances.
   * Cannot be tagged as internal: https://github.com/ReactiveX/rxjs/issues/6269
   */
  constructor(public errors: any[]) {
    super(
      errors
        ? `${errors.length} errors occurred during unsubscription:
  ${errors.map((err, i) => `${i + 1}) ${err.toString()}`).join('\n  ')}`
        : ''
    );
    this.name = 'UnsubscriptionError';
  }
}

/**
 * Represents a disposable resource, such as the execution of an Observable. A
 * Subscription has one important method, `unsubscribe`, that takes no argument
 * and just disposes the resource held by the subscription.
 *
 * Additionally, subscriptions may be grouped together through the `add()`
 * method, which will attach a child Subscription to the current Subscription.
 * When a Subscription is unsubscribed, all its children (and its grandchildren)
 * will be unsubscribed as well.
 */
export class Subscription implements SubscriptionLike {
  public static EMPTY = (() => {
    const empty = new Subscription();
    empty.closed = true;
    return empty;
  })();

  /**
   * A flag to indicate whether this Subscription has already been unsubscribed.
   */
  public closed = false;

  /**
   * The list of registered finalizers to execute upon unsubscription. Adding and removing from this
   * list occurs in the {@link #add} and {@link #remove} methods.
   */
  private _finalizers: Set<Exclude<TeardownLogic, void>> | null = null;

  /**
   * @param initialTeardown A function executed first as part of the finalization
   * process that is kicked off when {@link #unsubscribe} is called.
   */
  constructor(private initialTeardown?: () => void) {}

  /**
   * Disposes the resources held by the subscription. May, for instance, cancel
   * an ongoing Observable execution or cancel any other type of work that
   * started when the Subscription was created.
   */
  unsubscribe(): void {
    let errors: any[] | undefined;

    if (!this.closed) {
      this.closed = true;

      const { initialTeardown: initialFinalizer } = this;
      if (isFunction(initialFinalizer)) {
        try {
          initialFinalizer();
        } catch (e) {
          errors = e instanceof UnsubscriptionError ? e.errors : [e];
        }
      }

      const { _finalizers } = this;
      if (_finalizers) {
        this._finalizers = null;
        for (const finalizer of _finalizers) {
          try {
            execFinalizer(finalizer);
          } catch (err) {
            errors = errors ?? [];
            if (err instanceof UnsubscriptionError) {
              errors.push(...err.errors);
            } else {
              errors.push(err);
            }
          }
        }
      }

      if (errors) {
        throw new UnsubscriptionError(errors);
      }
    }
  }

  /**
   * Adds a finalizer to this subscription, so that finalization will be unsubscribed/called
   * when this subscription is unsubscribed. If this subscription is already {@link #closed},
   * because it has already been unsubscribed, then whatever finalizer is passed to it
   * will automatically be executed (unless the finalizer itself is also a closed subscription).
   *
   * Closed Subscriptions cannot be added as finalizers to any subscription. Adding a closed
   * subscription to a any subscription will result in no operation. (A noop).
   *
   * Adding a subscription to itself, or adding `null` or `undefined` will not perform any
   * operation at all. (A noop).
   *
   * `Subscription` instances that are added to this instance will automatically remove themselves
   * if they are unsubscribed. Functions and {@link Unsubscribable} objects that you wish to remove
   * will need to be removed manually with {@link #remove}
   *
   * @param teardown The finalization logic to add to this subscription.
   */
  add(teardown: TeardownLogic): void {
    // Only add the finalizer if it's not undefined
    // and don't add a subscription to itself.
    if (teardown && teardown !== this) {
      if (this.closed) {
        // If this subscription is already closed,
        // execute whatever finalizer is handed to it automatically.
        execFinalizer(teardown);
      } else {
        if (teardown && 'add' in teardown) {
          // If teardown is a subscription, we can make sure that if it
          // unsubscribes first, it removes itself from this subscription.
          teardown.add(() => {
            this.remove(teardown);
          });
        }

        this._finalizers ??= new Set();
        this._finalizers.add(teardown);
      }
    }
  }

  /**
   * Removes a finalizer from this subscription that was previously added with the {@link #add} method.
   *
   * Note that `Subscription` instances, when unsubscribed, will automatically remove themselves
   * from every other `Subscription` they have been added to. This means that using the `remove` method
   * is not a common thing and should be used thoughtfully.
   *
   * If you add the same finalizer instance of a function or an unsubscribable object to a `Subscription` instance
   * more than once, you will need to call `remove` the same number of times to remove all instances.
   *
   * All finalizer instances are removed to free up memory upon unsubscription.
   *
   * TIP: In instances you're adding and removing _Subscriptions from other Subscriptions_, you should
   * be sure to unsubscribe or otherwise get rid of the child subscription reference as soon as you remove it.
   * The child subscription has a reference to the parent it was added to via closure. In most cases, this
   * a non-issue, as child subscriptions are rarely long-lived.
   *
   * @param teardown The finalizer to remove from this subscription
   */
  remove(teardown: Exclude<TeardownLogic, void>): void {
    this._finalizers?.delete(teardown);
  }
}

// Even though Subscription only conditionally implements `Symbol.dispose`
// if it's available, we still need to declare it here so that TypeScript
// knows that it exists on the prototype when it is available.
export interface Subscription {
  [Symbol.dispose](): void;
}

if (typeof Symbol.dispose === 'symbol') {
  Subscription.prototype[Symbol.dispose] = Subscription.prototype.unsubscribe;
}

function execFinalizer(finalizer: Unsubscribable | (() => void)) {
  if (isFunction(finalizer)) {
    finalizer();
  } else {
    finalizer.unsubscribe();
  }
}

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

/**
 * The {@link GlobalConfig} object for RxJS. It is used to configure things
 * like how to react on unhandled errors.
 */
export const config: GlobalConfig = {
  onUnhandledError: null,
  onStoppedNotification: null,
};

/**
 * The global configuration object for RxJS, used to configure things
 * like how to react on unhandled errors. Accessible via {@link config}
 * object.
 */
export interface GlobalConfig {
  /**
   * A registration point for unhandled errors from RxJS. These are errors that
   * cannot were not handled by consuming code in the usual subscription path. For
   * example, if you have this configured, and you subscribe to an observable without
   * providing an error handler, errors from that subscription will end up here. This
   * will _always_ be called asynchronously on another job in the runtime. This is because
   * we do not want errors thrown in this user-configured handler to interfere with the
   * behavior of the library.
   */
  onUnhandledError: ((err: any) => void) | null;

  /**
   * A registration point for notifications that cannot be sent to subscribers because they
   * have completed, errored or have been explicitly unsubscribed. By default, next, complete
   * and error notifications sent to stopped subscribers are noops. However, sometimes callers
   * might want a different behavior. For example, with sources that attempt to report errors
   * to stopped subscribers, a caller can configure RxJS to throw an unhandled error instead.
   * This will _always_ be called asynchronously on another job in the runtime. This is because
   * we do not want errors thrown in this user-configured handler to interfere with the
   * behavior of the library.
   */
  onStoppedNotification: ((notification: ObservableNotification<any>, subscriber: Subscriber<any>) => void) | null;
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
  onStoppedNotification && setTimeout(() => onStoppedNotification(notification, subscriber));
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
 * subscription logic. This prevents "synchronous firehose" scenarios where an
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

// Ensure that `Symbol.dispose` is defined in TypeScript
declare global {
  interface SymbolConstructor {
    readonly dispose: unique symbol;
  }
}

/**
 * A representation of any set of values over any amount of time. This is the most basic building block
 * of RxJS.
 */
export class Observable<T> implements Subscribable<T> {
  /**
   * @param subscribe The function that is called when the Observable is
   * initially subscribed to. This function is given a Subscriber, to which new values
   * can be `next`ed, or an `error` method can be called to raise an error, or
   * `complete` can be called to notify of a successful completion.
   */
  constructor(subscribe?: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }

  /**
   * Invokes an execution of an Observable and registers Observer handlers for notifications it will emit.
   *
   * <span class="informal">Use it when you have all these Observables, but still nothing is happening.</span>
   *
   * `subscribe` is not a regular operator, but a method that calls Observable's internal `subscribe` function. It
   * might be for example a function that you passed to Observable's constructor, but most of the time it is
   * a library implementation, which defines what will be emitted by an Observable, and when it be will emitted. This means
   * that calling `subscribe` is actually the moment when Observable starts its work, not when it is created, as it is often
   * the thought.
   *
   * Apart from starting the execution of an Observable, this method allows you to listen for values
   * that an Observable emits, as well as for when it completes or errors. You can achieve this in two
   * of the following ways.
   *
   * The first way is creating an object that implements {@link Observer} interface. It should have methods
   * defined by that interface, but note that it should be just a regular JavaScript object, which you can create
   * yourself in any way you want (ES6 class, classic function constructor, object literal etc.). In particular, do
   * not attempt to use any RxJS implementation details to create Observers - you don't need them. Remember also
   * that your object does not have to implement all methods. If you find yourself creating a method that doesn't
   * do anything, you can simply omit it. Note however, if the `error` method is not provided and an error happens,
   * it will be thrown asynchronously. Errors thrown asynchronously cannot be caught using `try`/`catch`. Instead,
   * use the {@link onUnhandledError} configuration option or use a runtime handler (like `window.onerror` or
   * `process.on('error)`) to be notified of unhandled errors. Because of this, it's recommended that you provide
   * an `error` method to avoid missing thrown errors.
   *
   * The second way is to give up on Observer object altogether and simply provide callback functions in place of its methods.
   * This means you can provide three functions as arguments to `subscribe`, where the first function is equivalent
   * of a `next` method, the second of an `error` method and the third of a `complete` method. Just as in case of an Observer,
   * if you do not need to listen for something, you can omit a function by passing `undefined` or `null`,
   * since `subscribe` recognizes these functions by where they were placed in function call. When it comes
   * to the `error` function, as with an Observer, if not provided, errors emitted by an Observable will be thrown asynchronously.
   *
   * You can, however, subscribe with no parameters at all. This may be the case where you're not interested in terminal events
   * and you also handled emissions internally by using operators (e.g. using `tap`).
   *
   * Whichever style of calling `subscribe` you use, in both cases it returns a Subscription object.
   * This object allows you to call `unsubscribe` on it, which in turn will stop the work that an Observable does and will clean
   * up all resources that an Observable used. Note that cancelling a subscription will not call `complete` callback
   * provided to `subscribe` function, which is reserved for a regular completion signal that comes from an Observable.
   *
   * Remember that callbacks provided to `subscribe` are not guaranteed to be called asynchronously.
   * It is an Observable itself that decides when these functions will be called. For example {@link of}
   * by default emits all its values synchronously. Always check documentation for how given Observable
   * will behave when subscribed and if its default behavior can be modified with a `scheduler`.
   *
   * #### Examples
   *
   * Subscribe with an {@link guide/observer Observer}
   *
   * ```ts
   * import { of } from 'rxjs';
   *
   * const sumObserver = {
   *   sum: 0,
   *   next(value) {
   *     console.log('Adding: ' + value);
   *     this.sum = this.sum + value;
   *   },
   *   error() {
   *     // We actually could just remove this method,
   *     // since we do not really care about errors right now.
   *   },
   *   complete() {
   *     console.log('Sum equals: ' + this.sum);
   *   }
   * };
   *
   * of(1, 2, 3) // Synchronously emits 1, 2, 3 and then completes.
   *   .subscribe(sumObserver);
   *
   * // Logs:
   * // 'Adding: 1'
   * // 'Adding: 2'
   * // 'Adding: 3'
   * // 'Sum equals: 6'
   * ```
   *
   * Subscribe with functions ({@link deprecations/subscribe-arguments deprecated})
   *
   * ```ts
   * import { of } from 'rxjs'
   *
   * let sum = 0;
   *
   * of(1, 2, 3).subscribe(
   *   value => {
   *     console.log('Adding: ' + value);
   *     sum = sum + value;
   *   },
   *   undefined,
   *   () => console.log('Sum equals: ' + sum)
   * );
   *
   * // Logs:
   * // 'Adding: 1'
   * // 'Adding: 2'
   * // 'Adding: 3'
   * // 'Sum equals: 6'
   * ```
   *
   * Cancel a subscription
   *
   * ```ts
   * import { interval } from 'rxjs';
   *
   * const subscription = interval(1000).subscribe({
   *   next(num) {
   *     console.log(num)
   *   },
   *   complete() {
   *     // Will not be called, even when cancelling subscription.
   *     console.log('completed!');
   *   }
   * });
   *
   * setTimeout(() => {
   *   subscription.unsubscribe();
   *   console.log('unsubscribed!');
   * }, 2500);
   *
   * // Logs:
   * // 0 after 1s
   * // 1 after 2s
   * // 'unsubscribed!' after 2.5s
   * ```
   *
   * @param observerOrNext Either an {@link Observer} with some or all callback methods,
   * or the `next` handler that is called for each value emitted from the subscribed Observable.
   * @return A subscription reference to the registered handlers.
   */
  subscribe(observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null): Subscription {
    const subscriber = observerOrNext instanceof Subscriber ? observerOrNext : new Subscriber(observerOrNext);
    subscriber.add(this._trySubscribe(subscriber));
    return subscriber;
  }

  /** @internal */
  protected _trySubscribe(sink: Subscriber<T>): TeardownLogic {
    try {
      return this._subscribe(sink);
    } catch (err) {
      // We don't need to return anything in this case,
      // because it's just going to try to `add()` to a subscription
      // above.
      sink.error(err);
    }
  }

  /**
   * Used as a NON-CANCELLABLE means of subscribing to an observable, for use with
   * APIs that expect promises, like `async/await`. You cannot unsubscribe from this.
   *
   * **WARNING**: Only use this with observables you *know* will complete. If the source
   * observable does not complete, you will end up with a promise that is hung up, and
   * potentially all of the state of an async function hanging out in memory. To avoid
   * this situation, look into adding something like {@link timeout}, {@link take},
   * {@link takeWhile}, or {@link takeUntil} amongst others.
   *
   * #### Example
   *
   * ```ts
   * import { interval, take } from 'rxjs';
   *
   * const source$ = interval(1000).pipe(take(4));
   *
   * async function getTotal() {
   *   let total = 0;
   *
   *   await source$.forEach(value => {
   *     total += value;
   *     console.log('observable -> ' + value);
   *   });
   *
   *   return total;
   * }
   *
   * getTotal().then(
   *   total => console.log('Total: ' + total)
   * );
   *
   * // Expected:
   * // 'observable -> 0'
   * // 'observable -> 1'
   * // 'observable -> 2'
   * // 'observable -> 3'
   * // 'Total: 6'
   * ```
   *
   * @param next A handler for each value emitted by the observable.
   * @return A promise that either resolves on observable completion or
   * rejects with the handled error.
   */
  forEach(next: (value: T) => void): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const subscriber = new Subscriber({
        next: (value: T) => {
          try {
            next(value);
          } catch (err) {
            reject(err);
            subscriber.unsubscribe();
          }
        },
        error: reject,
        complete: resolve,
      });
      this.subscribe(subscriber);
    });
  }

  /** @internal */
  protected _subscribe(_subscriber: Subscriber<any>): TeardownLogic {
    return;
  }

  /**
   * An interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
   * @return This instance of the observable.
   */
  [Symbol.observable ?? '@@observable']() {
    return this;
  }

  pipe(): Observable<T>;
  pipe<A>(op1: UnaryFunction<Observable<T>, A>): A;
  pipe<A, B>(op1: UnaryFunction<Observable<T>, A>, op2: UnaryFunction<A, B>): B;
  pipe<A, B, C>(op1: UnaryFunction<Observable<T>, A>, op2: UnaryFunction<A, B>, op3: UnaryFunction<B, C>): C;
  pipe<A, B, C, D>(op1: UnaryFunction<Observable<T>, A>, op2: UnaryFunction<A, B>, op3: UnaryFunction<B, C>, op4: UnaryFunction<C, D>): D;
  pipe<A, B, C, D, E>(
    op1: UnaryFunction<Observable<T>, A>,
    op2: UnaryFunction<A, B>,
    op3: UnaryFunction<B, C>,
    op4: UnaryFunction<C, D>,
    op5: UnaryFunction<D, E>
  ): E;
  pipe<A, B, C, D, E, F>(
    op1: UnaryFunction<Observable<T>, A>,
    op2: UnaryFunction<A, B>,
    op3: UnaryFunction<B, C>,
    op4: UnaryFunction<C, D>,
    op5: UnaryFunction<D, E>,
    op6: UnaryFunction<E, F>
  ): F;
  pipe<A, B, C, D, E, F, G>(
    op1: UnaryFunction<Observable<T>, A>,
    op2: UnaryFunction<A, B>,
    op3: UnaryFunction<B, C>,
    op4: UnaryFunction<C, D>,
    op5: UnaryFunction<D, E>,
    op6: UnaryFunction<E, F>,
    op7: UnaryFunction<F, G>
  ): G;
  pipe<A, B, C, D, E, F, G, H>(
    op1: UnaryFunction<Observable<T>, A>,
    op2: UnaryFunction<A, B>,
    op3: UnaryFunction<B, C>,
    op4: UnaryFunction<C, D>,
    op5: UnaryFunction<D, E>,
    op6: UnaryFunction<E, F>,
    op7: UnaryFunction<F, G>,
    op8: UnaryFunction<G, H>
  ): H;
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: UnaryFunction<Observable<T>, A>,
    op2: UnaryFunction<A, B>,
    op3: UnaryFunction<B, C>,
    op4: UnaryFunction<C, D>,
    op5: UnaryFunction<D, E>,
    op6: UnaryFunction<E, F>,
    op7: UnaryFunction<F, G>,
    op8: UnaryFunction<G, H>,
    op9: UnaryFunction<H, I>
  ): I;
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: UnaryFunction<Observable<T>, A>,
    op2: UnaryFunction<A, B>,
    op3: UnaryFunction<B, C>,
    op4: UnaryFunction<C, D>,
    op5: UnaryFunction<D, E>,
    op6: UnaryFunction<E, F>,
    op7: UnaryFunction<F, G>,
    op8: UnaryFunction<G, H>,
    op9: UnaryFunction<H, I>,
    ...operations: OperatorFunction<any, any>[]
  ): Observable<unknown>;
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: UnaryFunction<Observable<T>, A>,
    op2: UnaryFunction<A, B>,
    op3: UnaryFunction<B, C>,
    op4: UnaryFunction<C, D>,
    op5: UnaryFunction<D, E>,
    op6: UnaryFunction<E, F>,
    op7: UnaryFunction<F, G>,
    op8: UnaryFunction<G, H>,
    op9: UnaryFunction<H, I>,
    ...operations: UnaryFunction<any, any>[]
  ): unknown;

  /**
   * Used to stitch together functional operators into a chain.
   *
   * ## Example
   *
   * ```ts
   * import { interval, filter, map, scan } from 'rxjs';
   *
   * interval(1000)
   *   .pipe(
   *     filter(x => x % 2 === 0),
   *     map(x => x + x),
   *     scan((acc, x) => acc + x)
   *   )
   *   .subscribe(x => console.log(x));
   * ```
   *
   * @return The Observable result of all the operators having been called
   * in the order they were passed in.
   */
  pipe(...operations: UnaryFunction<any, any>[]): unknown {
    return operations.reduce(pipeReducer, this as any);
  }

  /**
   * Observable is async iterable, so it can be used in `for await` loop. This method
   * of subscription is cancellable by breaking the for await loop. Although it's not
   * recommended to use Observable's AsyncIterable contract outside of `for await`, if
   * you're consuming the Observable as an AsyncIterable, and you're _not_ using `for await`,
   * you can use the `throw` or `return` methods on the `AsyncGenerator` we return to
   * cancel the subscription. Note that the subscription to the observable does not start
   * until the first value is requested from the AsyncIterable.
   *
   * Functionally, this is equivalent to using a {@link concatMap} with an `async` function.
   * That means that while the body of the `for await` loop is executing, any values that arrive
   * from the observable source will be queued up, so they can be processed by the `for await`
   * loop in order. So, like {@link concatMap} it's important to understand the speed your
   * source emits at, and the speed of the body of your `for await` loop.
   *
   * ## Example
   *
   * ```ts
   * import { interval } from 'rxjs';
   *
   * async function main() {
   *  // Subscribe to the observable using for await.
   *  for await (const value of interval(1000)) {
   *    console.log(value);
   *
   *    if (value > 5) {
   *      // Unsubscribe from the interval if we get a value greater than 5
   *      break;
   *    }
   *  }
   * }
   *
   * main();
   * ```
   */
  [Symbol.asyncIterator](): AsyncGenerator<T, void, void> {
    let subscription: Subscription | undefined;
    let hasError = false;
    let error: unknown;
    let completed = false;
    const values: T[] = [];
    const deferreds: [(value: IteratorResult<T>) => void, (reason: unknown) => void][] = [];

    const handleError = (err: unknown) => {
      hasError = true;
      error = err;
      while (deferreds.length) {
        const [_, reject] = deferreds.shift()!;
        reject(err);
      }
    };

    const handleComplete = () => {
      completed = true;
      while (deferreds.length) {
        const [resolve] = deferreds.shift()!;
        resolve({ value: undefined, done: true });
      }
    };

    return {
      next: (): Promise<IteratorResult<T>> => {
        if (!subscription) {
          // We only want to start the subscription when the user starts iterating.
          subscription = this.subscribe({
            next: (value) => {
              if (deferreds.length) {
                const [resolve] = deferreds.shift()!;
                resolve({ value, done: false });
              } else {
                values.push(value);
              }
            },
            error: handleError,
            complete: handleComplete,
          });
        }

        // If we already have some values in our buffer, we'll return the next one.
        if (values.length) {
          return Promise.resolve({ value: values.shift()!, done: false });
        }

        // This was already completed, so we're just going to return a done result.
        if (completed) {
          return Promise.resolve({ value: undefined, done: true });
        }

        // There was an error, so we're going to return an error result.
        if (hasError) {
          return Promise.reject(error);
        }

        // Otherwise, we need to make them wait for a value.
        return new Promise((resolve, reject) => {
          deferreds.push([resolve, reject]);
        });
      },
      throw: (err): Promise<IteratorResult<T>> => {
        subscription?.unsubscribe();
        // NOTE: I did some research on this, and as of Feb 2023, Chrome doesn't seem to do
        // anything with pending promises returned from `next()` when `throw()` is called.
        // However, for consumption of observables, I don't want RxJS taking the heat for that
        // quirk/leak of the type. So we're going to reject all pending promises we've nexted out here.
        handleError(err);
        return Promise.reject(err);
      },
      return: (): Promise<IteratorResult<T>> => {
        subscription?.unsubscribe();
        // NOTE: I did some research on this, and as of Feb 2023, Chrome doesn't seem to do
        // anything with pending promises returned from `next()` when `throw()` is called.
        // However, for consumption of observables, I don't want RxJS taking the heat for that
        // quirk/leak of the type. So we're going to resolve all pending promises we've nexted out here.
        handleComplete();
        return Promise.resolve({ value: undefined, done: true });
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }
}

function pipeReducer(prev: any, fn: UnaryFunction<any, any>) {
  return fn(prev);
}

/**
 * Handles an error on another job either with the user-configured {@link onUnhandledError},
 * or by throwing it on that new job so it can be picked up by `window.onerror`, `process.on('error')`, etc.
 *
 * This should be called whenever there is an error that is out-of-band with the subscription
 * or when an error hits a terminal boundary of the subscription and no error handler was provided.
 *
 * @param err the error to report
 */
export function reportUnhandledError(err: any) {
  setTimeout(() => {
    const { onUnhandledError } = config;
    if (onUnhandledError) {
      // Execute the user-configured error handler.
      onUnhandledError(err);
    } else {
      // Throw so it is picked up by the runtime's uncaught error mechanism.
      throw err;
    }
  });
}

/**
 * Creates an Observable from an Array, an array-like object, a Promise, an iterable object, or an Observable-like object.
 *
 * <span class="informal">Converts almost anything to an Observable.</span>
 *
 * ![](from.png)
 *
 * `from` converts various other objects and data types into Observables. It also converts a Promise, an array-like, or an
 * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterable" target="_blank">iterable</a>
 * object into an Observable that emits the items in that promise, array, or iterable. A String, in this context, is treated
 * as an array of characters. Observable-like objects (contains a function named with the ES2015 Symbol for Observable) can also be
 * converted through this operator.
 *
 * ## Examples
 *
 * Converts an array to an Observable
 *
 * ```ts
 * import { from } from 'rxjs';
 *
 * const array = [10, 20, 30];
 * const result = from(array);
 *
 * result.subscribe(x => console.log(x));
 *
 * // Logs:
 * // 10
 * // 20
 * // 30
 * ```
 *
 * Convert an infinite iterable (from a generator) to an Observable
 *
 * ```ts
 * import { from, take } from 'rxjs';
 *
 * function* generateDoubles(seed) {
 *    let i = seed;
 *    while (true) {
 *      yield i;
 *      i = 2 * i; // double it
 *    }
 * }
 *
 * const iterator = generateDoubles(3);
 * const result = from(iterator).pipe(take(10));
 *
 * result.subscribe(x => console.log(x));
 *
 * // Logs:
 * // 3
 * // 6
 * // 12
 * // 24
 * // 48
 * // 96
 * // 192
 * // 384
 * // 768
 * // 1536
 * ```
 *
 * @see {@link fromEvent}
 * @see {@link fromEventPattern}
 * @see {@link scheduled}
 *
 * @param input A subscription object, a Promise, an Observable-like,
 * an Array, an iterable, async iterable, or an array-like object to be converted.
 */

export function from<O extends ObservableInput<any>>(input: O): Observable<ObservedValueOf<O>>;
export function from<T>(input: ObservableInput<T>): Observable<T> {
  const type = getObservableInputType(input);
  switch (type) {
    case ObservableInputType.Own:
      return input as Observable<T>;
    case ObservableInputType.InteropObservable:
      return fromInteropObservable(input);
    case ObservableInputType.ArrayLike:
      return fromArrayLike(input as ArrayLike<T>);
    case ObservableInputType.Promise:
      return fromPromise(input as PromiseLike<T>);
    case ObservableInputType.AsyncIterable:
      return fromAsyncIterable(input as AsyncIterable<T>);
    case ObservableInputType.Iterable:
      return fromIterable(input as Iterable<T>);
    case ObservableInputType.ReadableStreamLike:
      return fromReadableStreamLike(input as ReadableStreamLike<T>);
  }
}

/**
 * Creates an RxJS Observable from an object that implements `Symbol.observable`.
 * @param obj An object that properly implements `Symbol.observable`.
 */
function fromInteropObservable<T>(obj: any) {
  return new Observable((subscriber: Subscriber<T>) => {
    const obs = obj[Symbol.observable ?? '@@observable']();
    if (isFunction(obs.subscribe)) {
      return obs.subscribe(subscriber);
    }
    // Should be caught by observable subscribe function error handling.
    throw new TypeError('Provided object does not correctly implement Symbol.observable');
  });
}

/**
 * Synchronously emits the values of an array like and completes.
 * This is exported because there are creation functions and operators that need to
 * make direct use of the same logic, and there's no reason to make them run through
 * `from` conditionals because we *know* they're dealing with an array.
 * @param array The array to emit values from
 */
export function fromArrayLike<T>(array: ArrayLike<T>) {
  return new Observable((subscriber: Subscriber<T>) => {
    subscribeToArray(array, subscriber);
  });
}

export function fromPromise<T>(promise: PromiseLike<T>) {
  return new Observable((subscriber: Subscriber<T>) => {
    promise
      .then(
        (value) => {
          if (!subscriber.closed) {
            subscriber.next(value);
            subscriber.complete();
          }
        },
        (err: any) => subscriber.error(err)
      )
      .then(null, reportUnhandledError);
  });
}

function fromIterable<T>(iterable: Iterable<T>) {
  return new Observable((subscriber: Subscriber<T>) => {
    for (const value of iterable) {
      subscriber.next(value);
      if (subscriber.closed) {
        return;
      }
    }
    subscriber.complete();
  });
}

function fromAsyncIterable<T>(asyncIterable: AsyncIterable<T>) {
  return new Observable((subscriber: Subscriber<T>) => {
    process(asyncIterable, subscriber).catch((err) => subscriber.error(err));
  });
}

function fromReadableStreamLike<T>(readableStream: ReadableStreamLike<T>) {
  return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
}

async function process<T>(asyncIterable: AsyncIterable<T>, subscriber: Subscriber<T>) {
  for await (const value of asyncIterable) {
    subscriber.next(value);
    // A side-effect may have closed our subscriber,
    // check before the next iteration.
    if (subscriber.closed) {
      return;
    }
  }
  subscriber.complete();
}

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
  for (let i = 0; i < length; i++) {
    if (subscriber.closed) {
      return;
    }
    // TODO(JamesHenry): discuss this added ! with Ben
    subscriber.next(array[i]!);
  }
  subscriber.complete();
}

export enum ObservableInputType {
  Own,
  InteropObservable,
  ArrayLike,
  Promise,
  AsyncIterable,
  Iterable,
  ReadableStreamLike,
}

export function getObservableInputType(input: unknown): ObservableInputType {
  if (input instanceof Observable) {
    return ObservableInputType.Own;
  }
  if (isInteropObservable(input)) {
    return ObservableInputType.InteropObservable;
  }
  if (isArrayLike(input)) {
    return ObservableInputType.ArrayLike;
  }
  if (isPromise(input)) {
    return ObservableInputType.Promise;
  }
  if (isAsyncIterable(input)) {
    return ObservableInputType.AsyncIterable;
  }
  if (isIterable(input)) {
    return ObservableInputType.Iterable;
  }
  if (isReadableStreamLike(input)) {
    return ObservableInputType.ReadableStreamLike;
  }
  throw new TypeError(
    `You provided ${
      input !== null && typeof input === 'object' ? 'an invalid object' : `'${input}'`
    } where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.`
  );
}

/**
 * Returns true if the object is a function.
 * @param value The value to check
 */
export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === 'function';
}

function isAsyncIterable<T>(obj: any): obj is AsyncIterable<T> {
  return Symbol.asyncIterator && isFunction(obj?.[Symbol.asyncIterator]);
}

export async function* readableStreamLikeToAsyncGenerator<T>(readableStream: ReadableStreamLike<T>): AsyncGenerator<T> {
  const reader = readableStream.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        return;
      }
      yield value!;
    }
  } finally {
    reader.releaseLock();
  }
}

function isReadableStreamLike<T>(obj: any): obj is ReadableStreamLike<T> {
  // We don't want to use instanceof checks because they would return
  // false for instances from another Realm, like an <iframe>.
  return isFunction(obj?.getReader);
}

/**
 * Tests to see if the object is "thennable".
 * @param value the object to test
 */
export function isPromise(value: any): value is PromiseLike<any> {
  return isFunction(value?.then);
}

/** Identifies an input as being Observable (but not necessary an Rx Observable) */
function isInteropObservable(input: any): input is InteropObservable<any> {
  return isFunction(input[Symbol.observable ?? '@@observable']);
}

/** Identifies an input as being an Iterable */
function isIterable(input: any): input is Iterable<any> {
  return isFunction(input?.[Symbol.iterator]);
}

export function isArrayLike<T>(x: any): x is ArrayLike<T> {
  return x && typeof x.length === 'number' && !isFunction(x);
}

/**
 * Tests to see if the object is an RxJS {@link Observable}
 * @param obj the object to test
 */
export function isObservable(obj: any): obj is Observable<unknown> {
  // The !! is to ensure that this publicly exposed function returns
  // `false` if something like `null` or `0` is passed.
  return !!obj && (obj instanceof Observable || (isFunction(obj.lift) && isFunction(obj.subscribe)));
}

/**
 * A completion object optimized for memory use and created to be the
 * same "shape" as other notifications in v8.
 * @internal
 */
export const COMPLETE_NOTIFICATION = (() => createNotification('C', undefined, undefined) as CompleteNotification)();

/**
 * Internal use only. Creates an optimized error notification that is the same "shape"
 * as other notifications.
 * @internal
 */
export function errorNotification(error: any): ErrorNotification {
  return createNotification('E', undefined, error) as any;
}

/**
 * Internal use only. Creates an optimized next notification that is the same "shape"
 * as other notifications.
 * @internal
 */
export function nextNotification<T>(value: T) {
  return createNotification('N', value, undefined) as NextNotification<T>;
}

export function createNotification<T>(kind: 'N', value: T, error: undefined): { kind: 'N'; value: T; error: undefined };
export function createNotification<T>(kind: 'E', value: undefined, error: any): { kind: 'E'; value: undefined; error: any };
export function createNotification<T>(kind: 'C', value: undefined, error: undefined): { kind: 'C'; value: undefined; error: undefined };
export function createNotification<T>(
  kind: 'N' | 'E' | 'C',
  value: T | undefined,
  error: any
): { kind: 'N' | 'E' | 'C'; value: T | undefined; error: any };

/**
 * Ensures that all notifications created internally have the same "shape" in v8.
 *
 * TODO: This is only exported to support a crazy legacy test in `groupBy`.
 * @internal
 */
export function createNotification<T>(kind: 'N' | 'E' | 'C', value: T | undefined, error: any) {
  return {
    kind,
    value,
    error,
  };
}
