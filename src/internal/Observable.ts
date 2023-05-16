import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { TeardownLogic, UnaryFunction, Subscribable, Observer, OperatorFunction } from './types';
import { observable as Symbol_observable } from './symbol/observable';
import { pipeFromArray } from './util/pipe';
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
  [Symbol_observable]() {
    return this;
  }

  /* tslint:disable:max-line-length */
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
  /* tslint:enable:max-line-length */

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
    return pipeFromArray(operations)(this);
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
