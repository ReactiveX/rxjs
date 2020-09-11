/** @prettier */
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { MonoTypeOperatorFunction, PartialObserver, TeardownLogic } from '../types';
import { noop } from '../util/noop';
import { isFunction } from '../util/isFunction';
import { lift } from '../util/lift';

/* tslint:disable:max-line-length */
/** @deprecated Use an observer instead of a complete callback */
export function tap<T>(next: null | undefined, error: null | undefined, complete: () => void): MonoTypeOperatorFunction<T>;
/** @deprecated Use an observer instead of an error callback */
export function tap<T>(next: null | undefined, error: (error: any) => void, complete?: () => void): MonoTypeOperatorFunction<T>;
/** @deprecated Use an observer instead of a complete callback */
export function tap<T>(next: (value: T) => void, error: null | undefined, complete: () => void): MonoTypeOperatorFunction<T>;
export function tap<T>(next?: (x: T) => void, error?: (e: any) => void, complete?: () => void): MonoTypeOperatorFunction<T>;
export function tap<T>(observer: PartialObserver<T>): MonoTypeOperatorFunction<T>;
/* tslint:enable:max-line-length */

/**
 * Used to perform side-effects for notifications from the source observable
 *
 * <span class="informal">Used when you want to affect outside state with a notification without altering the notification</span>
 *
 * ![](tap.png)
 *
 * Tap is designed to allow the developer a designated place to perform side effects. While you _could_ perform side-effects
 * inside of a `map` or a `mergeMap`, that would make their mapping functions impure, which isn't always a big deal, but will
 * make it so you can't do things like memoize those functions. The `tap` operator is designed solely for such side-effects to
 * help you remove side-effects from other operations.
 *
 * For any notification, next, error, or complete, `tap` will call the appropriate callback you have provided to it, via a function
 * reference, or a partial observer, then pass that notification down the stream.
 *
 * The observable returned by `tap` is an exact mirror of the source, with one exception: Any error that occurs -- synchronously -- in a handler
 * provided to `tap` will be emitted as an error from the returned observable.
 *
 * > Be careful! You can mutate objects as they pass through the `tap` operator's handlers.
 *
 * The most common use of `tap` is actually for debugging. You can place a `tap(console.log)` anywhere
 * in your observable `pipe`, log out the notifications as they are emitted by the source returned by the previous
 * operation.
 *
 * ## Example
 * Check a random number before it is handled. Below is an observable that will use a random number between 0 and 1,
 * and emit "big" or "small" depending on the size of that number. But we wanted to log what the original number
 * was, so we have added a `tap(console.log)`.
 *
 * ```ts
 * import { of } from 'rxjs';
 * import { tap, map } from 'rxjs/operators';
 *
 * of(Math.random()).pipe(
 *   tap(console.log),
 *   map(n => n > 0.5 ? 'big' : 'small')
 * ).subscribe(console.log);
 * ```
 *
 * ## Example
 * Using `tap` to analyze a value and force an error. Below is an observable where in our system we only
 * want to emit numbers 3 or less we get from another source. We can force our observable to error
 * using `tap`.
 *
 * ```ts
 * import { of } from 'rxjs':
 * import { tap } from 'rxjs/operators';
 *
 * const source = of(1, 2, 3, 4, 5)
 *
 * source.pipe(
 *  tap(n => {
 *    if (n > 3) {
 *      throw new TypeError(`Value ${n} is greater than 3`)
 *    }
 *  })
 * )
 * .subscribe(console.log);
 * ```
 *
 * ## Example
 * We want to know when an observable completes before moving on to the next observable. The system
 * below will emit a random series of `"X"` characters from 3 different observables in sequence. The
 * only way we know when one observable completes and moves to the next one, in this case, is because
 * we have added a `tap` with the side-effect of logging to console.
 *
 * ```ts
 * import { of, interval } from 'rxjs';
 * import { tap, concatMap, take } from 'rxjs';
 *
 *
 * of(1, 2, 3).pipe(
 *  concatMap(n => interval.pipe(
 *    take(Math.round(Math.random() * 10)),
 *    map(() => 'X'),
 *    tap({
 *      complete: () => console.log(`Done with ${n}`)
 *    })
 *  ))
 * )
 * .subscribe(console.log);
 * ```
 *
 * @see {@link finalize}
 * @see {@link Observable#subscribe}
 *
 * @param nextOrObserver A next handler or partial observer
 * @param error An error handler
 * @param complete A completion handler
 */
export function tap<T>(
  nextOrObserver?: PartialObserver<T> | ((x: T) => void) | null,
  error?: ((e: any) => void) | null,
  complete?: (() => void) | null
): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>): Observable<T> => {
    return lift(source, function (this: Subscriber<T>, source: Observable<T>) {
      const subscriber = this;
      let onNext: (value: T) => void;
      let onError: (err: any) => void;
      let onComplete: () => void;

      /**
       * A helper to ensure that errors thrown in handlers get
       * caught and sent do the consumer as an error notification.
       */
      const wrap = (fn: any) => (arg?: any) => {
        try {
          fn(arg);
        } catch (err) {
          subscriber.error(err);
        }
      };

      if (!nextOrObserver || typeof nextOrObserver === 'function') {
        // We have callback functions (or maybe nothing?)

        // Bind the next observer to the subscriber. This is an undocumented legacy behavior
        // We want to deprecate, but it technically allows for users to call `this.unsubscribe()`
        // in the next callback. Again, this is a deprecated, undocumented behavior and we
        // do not want to allow this in upcoming versions.
        onNext = nextOrObserver ? wrap(nextOrObserver.bind(subscriber)) : noop;

        // We don't need to bind the other two callbacks if they exist. There is nothing
        // relevant on the subscriber to call during an error or complete callback, as
        // it is about to unsubscribe.
        onError = error ? wrap(error) : noop;
        onComplete = complete ? wrap(complete) : noop;
      } else {
        // We recieved a partial observer. Make sure the handlers are bound to their
        // original parent, and wrap them with the appropriate error handling.
        const { next, error, complete } = nextOrObserver;
        onNext = next ? wrap(next.bind(nextOrObserver)) : noop;
        onError = error ? wrap(error.bind(nextOrObserver)) : noop;
        onComplete = complete ? wrap(complete.bind(nextOrObserver)) : noop;
      }
      return source.subscribe(new TapSubscriber(this, onNext, onError, onComplete));
    });
  };
}

class TapSubscriber<T> extends Subscriber<T> {
  constructor(
    destination: Subscriber<T>,
    private onNext: (value: T) => void,
    private onError: (err: any) => void,
    private onComplete: () => void
  ) {
    super(destination);
  }

  protected _next(value: T) {
    this.onNext(value);
    super._next(value);
  }

  protected _error(err: any) {
    this.onError(err);
    super._error(err);
  }

  protected _complete() {
    this.onComplete();
    super._complete();
  }
}
