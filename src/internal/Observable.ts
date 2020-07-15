/**
 * @prettier
 */
import { Operator } from './Operator';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { TeardownLogic, OperatorFunction, PartialObserver, Subscribable } from './types';
import { canReportError } from './util/canReportError';
import { toSubscriber } from './util/toSubscriber';
import { observable as Symbol_observable } from './symbol/observable';
import { pipeFromArray } from './util/pipe';
import { config } from './config';
import { values } from 'lodash';

/**
 * A representation of any set of values over any amount of time. This is the most basic building block
 * of RxJS.
 *
 * @class Observable<T>
 */
export class Observable<T> implements Subscribable<T> {
  /** @deprecated This is an internal implementation detail, do not use. */
  protected source: Observable<any> | undefined;

  /** @deprecated This is an internal implementation detail, do not use. */
  protected operator: Operator<any, T> | undefined;

  /**
   * @constructor
   * @param {Function} subscribe the function that is called when the Observable is
   * initially subscribed to. This function is given a Subscriber, to which new values
   * can be `next`ed, or an `error` method can be called to raise an error, or
   * `complete` can be called to notify of a successful completion.
   */
  constructor(subscribe?: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }

  // HACK: Since TypeScript inherits static properties too, we have to
  // fight against TypeScript here so Subject can have a different static create signature
  /**
   * Creates a new cold Observable by calling the Observable constructor
   * @static true
   * @owner Observable
   * @method create
   * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
   * @return {Observable} a new cold observable
   * @nocollapse
   * @deprecated use new Observable() instead
   */
  static create: Function = <T>(subscribe?: (subscriber: Subscriber<T>) => TeardownLogic) => {
    return new Observable<T>(subscribe);
  };

  /**
   * Creates a new Observable, with this Observable instance as the source, and the passed
   * operator defined as the new observable's operator.
   * @method lift
   * @param operator the operator defining the operation to take on the observable
   * @return a new observable with the Operator applied
   * @deprecated This is an internal implementation detail, do not use directly. If you have implemented an operator
   * using `lift`, it is recommended that you create an operator by simply returning `new Observable()` directly.
   * See "Creating new operators from scratch" section here: https://rxjs.dev/guide/operators
   */
  protected lift<R>(operator?: Operator<T, R>): Observable<R> {
    const observable = new Observable<R>();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  subscribe(observer?: PartialObserver<T>): Subscription;
  subscribe(observer: PartialObserver<T> | null | undefined, signal: AbortSignal | null | undefined): Subscription;
  /** @deprecated Use an observer instead of a complete callback */
  subscribe(next: null | undefined, error: null | undefined, complete: () => void): Subscription;
  /** @deprecated Use an observer instead of an error callback */
  subscribe(next: null | undefined, error: (error: any) => void, complete?: () => void): Subscription;
  /** @deprecated Use an observer instead of a complete callback */
  subscribe(next: (value: T) => void, error: null | undefined, complete: () => void): Subscription;
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription;
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
   * yourself in any way you want (ES6 class, classic function constructor, object literal etc.). In particular do
   * not attempt to use any RxJS implementation details to create Observers - you don't need them. Remember also
   * that your object does not have to implement all methods. If you find yourself creating a method that doesn't
   * do anything, you can simply omit it. Note however, if the `error` method is not provided, all errors will
   * be left uncaught.
   *
   * The second way is to give up on Observer object altogether and simply provide callback functions in place of its methods.
   * This means you can provide three functions as arguments to `subscribe`, where the first function is equivalent
   * of a `next` method, the second of an `error` method and the third of a `complete` method. Just as in case of Observer,
   * if you do not need to listen for something, you can omit a function, preferably by passing `undefined` or `null`,
   * since `subscribe` recognizes these functions by where they were placed in function call. When it comes
   * to `error` function, just as before, if not provided, errors emitted by an Observable will be thrown.
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
   * ## Example
   * ### Subscribe with an Observer
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
   * // "Adding: 1"
   * // "Adding: 2"
   * // "Adding: 3"
   * // "Sum equals: 6"
   * ```
   *
   * ### Subscribe with functions
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
   * // "Adding: 1"
   * // "Adding: 2"
   * // "Adding: 3"
   * // "Sum equals: 6"
   * ```
   *
   * ### Cancel a subscription
   * ```ts
   * import { interval } from 'rxjs';
   *
   * const subscription = interval(1000).subscribe(
   *   num => console.log(num),
   *   undefined,
   *   () => {
   *     // Will not be called, even when cancelling subscription.
   *     console.log('completed!');
   *   }
   * );
   *
   * setTimeout(() => {
   *   subscription.unsubscribe();
   *   console.log('unsubscribed!');
   * }, 2500);
   *
   * // Logs:
   * // 0 after 1s
   * // 1 after 2s
   * // "unsubscribed!" after 2.5s
   * ```
   *
   * @param {Observer|Function} observerOrNext (optional) Either an observer with methods to be called,
   *  or the first of three possible handlers, which is the handler for each value emitted from the subscribed
   *  Observable.
   * @param {Function} error (optional) A handler for a terminal event resulting from an error. If no error handler is provided,
   *  the error will be thrown as unhandled.
   * @param {Function} complete (optional) A handler for a terminal event resulting from successful completion.
   * @return {ISubscription} a subscription reference to the registered handlers
   * @method subscribe
   */
  subscribe(
    observerOrNext?: PartialObserver<T> | ((value: T) => void) | null,
    errorOrSignal?: ((error: any) => void) | null | AbortSignal,
    complete?: (() => void) | null
  ): Subscription {
    const { operator } = this;

    let error: ((error: any) => void) | null | undefined = null;
    let signal: AbortSignal | undefined = undefined;
    if (isAbortSignal(errorOrSignal)) {
      signal = errorOrSignal;
      if (signal.aborted) {
        return Subscription.EMPTY;
      }
    } else {
      error = errorOrSignal;
    }

    const sink = toSubscriber(observerOrNext, error, complete);

    if (signal) {
      const handler = () => {
        sink.unsubscribe();
      };
      signal.addEventListener('abort', handler);
      sink.add(() => {
        signal?.removeEventListener('abort', handler);
      });
    }

    if (operator) {
      sink.add(operator.call(sink, this.source));
    } else {
      sink.add(
        this.source || (config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable)
          ? this._subscribe(sink)
          : this._trySubscribe(sink)
      );
    }

    if (config.useDeprecatedSynchronousErrorHandling) {
      if (sink.syncErrorThrowable) {
        sink.syncErrorThrowable = false;
        if (sink.syncErrorThrown) {
          throw sink.syncErrorValue;
        }
      }
    }

    return sink;
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  protected _trySubscribe(sink: Subscriber<T>): TeardownLogic {
    try {
      return this._subscribe(sink);
    } catch (err) {
      if (config.useDeprecatedSynchronousErrorHandling) {
        sink.syncErrorThrown = true;
        sink.syncErrorValue = err;
      }
      if (canReportError(sink)) {
        sink.error(err);
      } else {
        console.warn(err);
      }
    }
  }

  /**
   * Subscribes to the observable in a way that returns a promise. Useful for async-await and
   * other promise-based APIs.
   *
   * Returns a promise that will:
   *
   * - Resolve when the observable's producer completes and is done pushing values.
   * - Rejects with the error if the observable's producer errors and can no longer produce values.
   * - Rejects with an AbortError (see note below) if a passed `AbortSignal` signals.
   *
   * ### Example
   *
   * ```ts
   * import { interval, isAbortError } from 'rxjs';
   * import { take } from 'rxjs/operators';
   *
   * async function test() {
   *    const source = interval(200);
   *
   *    console.log('start first forEach');
   *    await source.pipe(take(4)).forEach(console.log);
   *    console.log('first forEach complete');
   *
   *    const ac = new AbortController();
   *    setTimeout(() => {
   *      // unsubscribe after ~1 second
   *      ac.abort();
   *    }, 1000);
   *
   *    console.log('start second forEach');
   *    try {
   *      await source.forEach(console.log, ac.signal);
   *    } catch (err) {
   *      if (isAbortError(err)) {
   *        console.log('second forEach cancelled');
   *      }
   *    }
   * }
   *
   * test();
   *
   * // Expected output
   * // "start first forEach"
   * // 0
   * // 1
   * // 2
   * // 3
   * // "first forEach complete"
   * // "start second forEach"
   * // 0
   * // 1
   * // 2
   * // 3
   * // 4
   * // "second forEach cancelled"
   * ```
   *
   * NOTE: `AbortError` isn't really a type yet. At the time of this writing, Chrome and Firefox utilize
   * DOMException for `fetch` calls that are aborted via `AbortSignal`. However, MDN Documentation currently
   * states that should be `AbortError`. As a middle ground, RxJS is currently just rejecting with a
   * plain `Error`, that has a `name` of `"AbortError"`. RxJS provides a helper method called {@link isAbortError}
   * to allow you to check to see if a promise rejection was due to cancellation via `abort` or not.
   * The idea is that as this semantic evolves in various runtimes, we can evolve the inner workings of
   * `isAbortError` without breaking your code. (we hope, lol).
   *
   * @param nextHandler A handler that is fired for each value pushed from the producer.
   * @param signal A signal that can be used to unsubscribe, and tell the producer to
   * stop pushing values. If the subscription ends because of this signal, the returned
   * promise will reject. You can determine this rejection was from the signal using
   * {@link isAbortError}
   */
  forEach(nextHandler: (value: T) => void, signal?: AbortSignal): Promise<void>;

  /**
   * @param nextHandler a handler for each value emitted by the observable
   * @param promiseCtor a constructor function used to instantiate the Promise
   * @return a promise that either resolves on observable completion or
   *  rejects with the handled error
   * @deprecated remove in v8. Passing a Promise constructor will no longer be available
   * in upcoming versions of RxJS. This is because it adds weight to the library, for very
   * little benefit. If you need this functionality, it is recommended that you either
   * polyfill Promise, or you create an adapter to convert the returned native promise
   * to whatever promise implementation you wanted.
   */
  forEach(nextHandler: (value: T) => void, promiseCtor: PromiseConstructorLike): Promise<void>;

  forEach(nextHandler: (value: T) => void, promiseCtorOrSignal?: PromiseConstructorLike | AbortSignal): Promise<void> {
    let promiseCtor: PromiseConstructorLike | undefined;
    let signal: AbortSignal | undefined;
    if (isAbortSignal(promiseCtorOrSignal)) {
      signal = promiseCtorOrSignal;
    } else {
      promiseCtor = promiseCtorOrSignal;
    }

    promiseCtor = getPromiseCtor(promiseCtor);

    return new promiseCtor<void>((resolve, reject) => {
      if (signal) {
        signal.addEventListener(
          'abort',
          () => {
            // TODO: Chrome and Firefox both use DOMException here for now
            // This should probably be something better defined. MDN documentation
            // says there is supposed to be an AbortError, but I haven't found any
            // implementations in any runtimes. For now, we can document this
            // as the users needing to check `err.name === 'AbortError'` and
            // adjust over time.
            const err = new Error('Abort exception');
            err.name = 'AbortError';
            reject(err);
          },
          { once: true }
        );
      }

      // Must be declared in a separate statement to avoid a ReferenceError when
      // accessing subscription below in the closure due to Temporal Dead Zone.
      let subscription: Subscription;
      subscription = this.subscribe(
        {
          next(value) {
            try {
              nextHandler(value);
            } catch (err) {
              reject(err);
              if (subscription) {
                subscription.unsubscribe();
              }
            }
          },
          error: reject,
          complete: resolve,
        },
        signal
      );
    }) as Promise<void>;
  }

  /** @internal This is an internal implementation detail, do not use. */
  protected _subscribe(subscriber: Subscriber<any>): TeardownLogic {
    const { source } = this;
    return source && source.subscribe(subscriber);
  }

  /**
   * An interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
   * @method Symbol.observable
   * @return {Observable} this instance of the observable
   */
  [Symbol_observable]() {
    return this;
  }

  /* tslint:disable:max-line-length */
  pipe(): Observable<T>;
  pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
  pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
  pipe<A, B, C>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Observable<C>;
  pipe<A, B, C, D>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>
  ): Observable<D>;
  pipe<A, B, C, D, E>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>
  ): Observable<E>;
  pipe<A, B, C, D, E, F>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>
  ): Observable<F>;
  pipe<A, B, C, D, E, F, G>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>
  ): Observable<G>;
  pipe<A, B, C, D, E, F, G, H>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>
  ): Observable<H>;
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>
  ): Observable<I>;
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>,
    ...operations: OperatorFunction<any, any>[]
  ): Observable<unknown>;
  /* tslint:enable:max-line-length */

  /**
   * Used to stitch together functional operators into a chain.
   * @method pipe
   * @return {Observable} the Observable result of all of the operators having
   * been called in the order they were passed in.
   *
   * ### Example
   * ```ts
   * import { interval } from 'rxjs';
   * import { map, filter, scan } from 'rxjs/operators';
   *
   * interval(1000)
   *   .pipe(
   *     filter(x => x % 2 === 0),
   *     map(x => x + x),
   *     scan((acc, x) => acc + x)
   *   )
   *   .subscribe(x => console.log(x))
   * ```
   */
  pipe(...operations: OperatorFunction<any, any>[]): Observable<any> {
    if (operations.length === 0) {
      return this as any;
    }

    return pipeFromArray(operations)(this);
  }

  /* tslint:disable:max-line-length */
  /** @deprecated Deprecated use {@link firstValueFrom} or {@link lastValueFrom} instead */
  toPromise<T>(this: Observable<T>): Promise<T | undefined>;
  /** @deprecated Deprecated use {@link firstValueFrom} or {@link lastValueFrom} instead */
  toPromise<T>(this: Observable<T>, PromiseCtor: typeof Promise): Promise<T | undefined>;
  /** @deprecated Deprecated use {@link firstValueFrom} or {@link lastValueFrom} instead */
  toPromise<T>(this: Observable<T>, PromiseCtor: PromiseConstructorLike): Promise<T | undefined>;
  /* tslint:enable:max-line-length */

  /**
   * Subscribe to this Observable and get a Promise resolving on
   * `complete` with the last emission (if any).
   *
   * **WARNING**: Only use this with observables you *know* will complete. If the source
   * observable does not complete, you will end up with a promise that is hung up, and
   * potentially all of the state of an async function hanging out in memory. To avoid
   * this situation, look into adding something like {@link timeout}, {@link take},
   * {@link takeWhile}, or {@link takeUntil} amongst others.
   *
   * @method toPromise
   * @param [promiseCtor] a constructor function used to instantiate
   * the Promise
   * @return A Promise that resolves with the last value emit, or
   * rejects on an error. If there were no emissions, Promise
   * resolves with undefined.
   * @deprecated Deprecated use {@link firstValueFrom} or {@link lastValueFrom} instead
   */
  toPromise(promiseCtor?: PromiseConstructorLike): Promise<T | undefined> {
    promiseCtor = getPromiseCtor(promiseCtor);

    return new promiseCtor((resolve, reject) => {
      let value: T | undefined;
      this.subscribe(
        (x: T) => (value = x),
        (err: any) => reject(err),
        () => resolve(value)
      );
    }) as Promise<T | undefined>;
  }
}

/**
 * Decides between a passed promise constructor from consuming code,
 * A default configured promise constructor, and the native promise
 * constructor and returns it. If nothing can be found, it will throw
 * an error.
 * @param promiseCtor The optional promise constructor to passed by consuming code
 */
function getPromiseCtor(promiseCtor: PromiseConstructorLike | undefined) {
  if (!promiseCtor) {
    promiseCtor = config.Promise || Promise;
  }

  if (!promiseCtor) {
    throw new Error('no Promise impl found');
  }

  return promiseCtor;
}

function isAbortSignal(value: any): value is AbortSignal {
  return (
    (typeof AbortSignal !== 'undefined' && value instanceof AbortSignal) ||
    (value && 'aborted' in value && typeof value.addEventListener === 'function' && typeof value.removeEventListener === 'function')
  );
}

/**
 * A utility function to check to see if an error is an error created because a
 * subscription was aborted in a method that returns a promise, such as {@link forEach}.
 *
 * Promises must resolve or reject, therefor aborting a subscription that was supposed to
 * either resolve or reject a promise must be rejected, so the promise does not just
 * hang out in memory.
 *
 * This is most useful in async-await.
 *
 * RxJS is providing this helper method because the error that is returned in
 * @param value The error to test to see if you have an abort error.
 */
export function isAbortError(value: any): boolean {
  return (
    (value && value.name === 'AbortError') ||
    // It could be an abort error from an inner fetch, and Firefox and Chrome, as of this
    // writing, reject with a DOMException. There's no telling what other platforms will
    // do, or how this will change over time. We may need to add more do this conditional.
    (typeof DOMException !== 'undefined' && value instanceof DOMException)
  );
}
