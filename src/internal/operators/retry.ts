import { MonoTypeOperatorFunction, ObservableInput } from '../types';
import { operate } from '../util/lift';
import { Subscription } from '../Subscription';
import { OperatorSubscriber } from './OperatorSubscriber';
import { identity } from '../util/identity';
import { timer } from '../observable/timer';
import { innerFrom } from '../observable/from';

export interface RetryConfig {
  /**
   * The maximum number of times to retry.
   */
  count?: number;
  /**
   * The number of milliseconds to delay before retrying, OR a function to
   * return a notifier for delaying. If a function is returned, that function should
   * return a notifier that, when it emits will retry the source. If the notifier
   * completes _without_ emitting, the resulting observable will complete without error,
   * if the notifier errors, the error will be pushed to the result.
   */
  delay?: number | ((error: any, retryCount: number) => ObservableInput<any>);
  /**
   * Whether or not to reset the retry counter when the retried subscription
   * emits its first value.
   */
  resetOnSuccess?: boolean;
}

/**
 * Returns an Observable that mirrors the source Observable with the exception of an `error`. If the source Observable
 * calls `error`, this method will resubscribe to the source Observable for a maximum of `count` resubscriptions (given
 * as a number parameter) rather than propagating the `error` call.
 *
 * ![](retry.png)
 *
 * Any and all items emitted by the source Observable will be emitted by the resulting Observable, even those emitted
 * during failed subscriptions. For example, if an Observable fails at first but emits [1, 2] then succeeds the second
 * time and emits: [1, 2, 3, 4, 5] then the complete stream of emissions and notifications
 * would be: [1, 2, 1, 2, 3, 4, 5, `complete`].
 *
 * ## Example
 * ```ts
 * import { interval, of, throwError } from 'rxjs';
 * import { mergeMap, retry } from 'rxjs/operators';
 *
 * const source = interval(1000);
 * const example = source.pipe(
 *   mergeMap(val => {
 *     if(val > 5){
 *       return throwError('Error!');
 *     }
 *     return of(val);
 *   }),
 *   //retry 2 times on error
 *   retry(2)
 * );
 *
 * const subscribe = example.subscribe({
 *   next: val => console.log(val),
 *   error: val => console.log(`${val}: Retried 2 times then quit!`)
 * });
 *
 * // Output:
 * // 0..1..2..3..4..5..
 * // 0..1..2..3..4..5..
 * // 0..1..2..3..4..5..
 * // "Error!: Retried 2 times then quit!"
 * ```
 *
 * @param count - Number of retry attempts before failing.
 * @param resetOnSuccess - When set to `true` every successful emission will reset the error count
 * @return A function that returns an Observable that will resubscribe to the
 * source stream when the source stream errors, at most `count` times.
 */
export function retry<T>(count?: number): MonoTypeOperatorFunction<T>;

/**
 * Returns an observable that mirrors the source observable unless it errors. If it errors, the source observable
 * will be resubscribed to (or "retried") based on the configuration passed here. See documentation
 * for {@link RetryConfig} for more details.
 *
 * @param config - The retry configuration
 */
export function retry<T>(config: RetryConfig): MonoTypeOperatorFunction<T>;

export function retry<T>(configOrCount: number | RetryConfig = Infinity): MonoTypeOperatorFunction<T> {
  let config: RetryConfig;
  if (configOrCount && typeof configOrCount === 'object') {
    config = configOrCount;
  } else {
    config = {
      count: configOrCount,
    };
  }
  const { count = Infinity, delay, resetOnSuccess: resetOnSuccess = false } = config;

  return count <= 0
    ? identity
    : operate((source, subscriber) => {
        let soFar = 0;
        let innerSub: Subscription | null;
        const subscribeForRetry = () => {
          let syncUnsub = false;
          innerSub = source.subscribe(
            new OperatorSubscriber(
              subscriber,
              (value) => {
                // If we're resetting on success
                if (resetOnSuccess) {
                  soFar = 0;
                }
                subscriber.next(value);
              },
              // Completions are passed through to consumer.
              undefined,
              (err) => {
                if (soFar++ < count) {
                  // We are still under our retry count
                  const resub = () => {
                    if (innerSub) {
                      innerSub.unsubscribe();
                      innerSub = null;
                      subscribeForRetry();
                    } else {
                      syncUnsub = true;
                    }
                  };

                  if (delay != null) {
                    // The user specified a retry delay.
                    // They gave us a number, use a timer, otherwise, it's a function,
                    // and we're going to call it to get a notifier.
                    const notifier = typeof delay === 'number' ? timer(delay) : innerFrom(delay(err, soFar));
                    const notifierSubscriber = new OperatorSubscriber(
                      subscriber,
                      () => {
                        // After we get the first notification, we
                        // unsubscribe from the notifer, because we don't want anymore
                        // and we resubscribe to the source.
                        notifierSubscriber.unsubscribe();
                        resub();
                      },
                      () => {
                        // The notifier completed without emitting.
                        // The author is telling us they want to complete.
                        subscriber.complete();
                      }
                    );
                    notifier.subscribe(notifierSubscriber);
                  } else {
                    // There was no notifier given. Just resub immediately.
                    resub();
                  }
                } else {
                  // We're past our maximum number of retries.
                  // Just send along the error.
                  subscriber.error(err);
                }
              }
            )
          );
          if (syncUnsub) {
            innerSub.unsubscribe();
            innerSub = null;
            subscribeForRetry();
          }
        };
        subscribeForRetry();
      });
}
