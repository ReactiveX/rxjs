import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';

import { MonoTypeOperatorFunction } from '../types';
import { lift } from '../util/lift';
import { Subscription } from '../Subscription';
import { EMPTY } from '../observable/empty';

export interface RetryConfig {
  count: number;
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
 * @param {number} count - Number of retry attempts before failing.
 * @param {boolean} resetOnSuccess - When set to `true` every successful emission will reset the error count
 * @return {Observable} The source Observable modified with the retry logic.
 * @name retry
 */
export function retry<T>(count?: number): MonoTypeOperatorFunction<T>;
export function retry<T>(config: RetryConfig): MonoTypeOperatorFunction<T>;
export function retry<T>(configOrCount: number | RetryConfig = Infinity): MonoTypeOperatorFunction<T> {
  let config: RetryConfig;
  if (configOrCount && typeof configOrCount === 'object') {
    config = configOrCount;
  } else {
    config = {
      count: configOrCount
    };
  }
  const { count, resetOnSuccess = false } = config;

  return (source: Observable<T>) => count <= 0 ? EMPTY: lift(source, function (this: Subscriber<T>, source: Observable<T>) {
    const subscriber = this;
    let soFar = 0;
    const subscription = new Subscription();
    let innerSub: Subscription | null;
    const subscribeForRetry = () => {
      let syncUnsub = false;
      innerSub = source.subscribe({
        next: (value) => {
          if (resetOnSuccess) {
            soFar = 0;
          }
          subscriber.next(value);
        },
        error: (err) => {
          if (soFar++ < count) {
            if (innerSub) {
              innerSub.unsubscribe();
              innerSub = null;
              subscribeForRetry();
            } else {
              syncUnsub = true;
            }
          } else {
            subscriber.error(err);
          }
        },
        complete: () => subscriber.complete(),
      });
      if (syncUnsub) {
        innerSub.unsubscribe();
        innerSub = null;
        subscribeForRetry();
      } else {
        subscription.add(innerSub);
      }
    };
    subscribeForRetry();
    return subscription;
  })
}