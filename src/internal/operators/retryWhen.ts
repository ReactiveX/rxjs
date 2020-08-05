/** @prettier */
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { Subscription } from '../Subscription';

import { MonoTypeOperatorFunction } from '../types';
import { lift } from '../util/lift';

/**
 * Returns an Observable that mirrors the source Observable with the exception of an `error`. If the source Observable
 * calls `error`, this method will emit the Throwable that caused the error to the Observable returned from `notifier`.
 * If that Observable calls `complete` or `error` then this method will call `complete` or `error` on the child
 * subscription. Otherwise this method will resubscribe to the source Observable.
 *
 * ![](retryWhen.png)
 *
 * Retry an observable sequence on error based on custom criteria.
 *
 * ## Example
 * ```ts
 * import { timer, interval } from 'rxjs';
 * import { map, tap, retryWhen, delayWhen } from 'rxjs/operators';
 *
 * const source = interval(1000);
 * const example = source.pipe(
 *   map(val => {
 *     if (val > 5) {
 *       // error will be picked up by retryWhen
 *       throw val;
 *     }
 *     return val;
 *   }),
 *   retryWhen(errors =>
 *     errors.pipe(
 *       // log error message
 *       tap(val => console.log(`Value ${val} was too high!`)),
 *       // restart in 5 seconds
 *       delayWhen(val => timer(val * 1000))
 *     )
 *   )
 * );
 *
 * const subscribe = example.subscribe(val => console.log(val));
 *
 * // results:
 * //   0
 * //   1
 * //   2
 * //   3
 * //   4
 * //   5
 * //   "Value 6 was too high!"
 * //  --Wait 5 seconds then repeat
 * ```
 *
 * @param {function(errors: Observable): Observable} notifier - Receives an Observable of notifications with which a
 * user can `complete` or `error`, aborting the retry.
 * @return {Observable} The source Observable modified with retry logic.
 * @name retryWhen
 */
export function retryWhen<T>(notifier: (errors: Observable<any>) => Observable<any>): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) =>
    lift(source, function (this: Subscriber<T>, source: Observable<T>) {
      const subscriber = this;
      const subscription = new Subscription();
      let innerSub: Subscription | null;
      let syncResub = false;
      let errors$: Subject<any>;

      /**
       * Gets the subject to send errors through. If it doesn't exist,
       * we know we need to setup the notifier.
       */
      const getErrorSubject = () => {
        if (!errors$) {
          errors$ = new Subject();
          let notifier$: Observable<any>;
          // The notifier is a user-provided function, so we need to do
          // some error handling.
          try {
            notifier$ = notifier(errors$);
          } catch (err) {
            subscriber.error(err);
            // Returning null here will cause the code below to
            // notice there's been a problem and skip error notification.
            return null;
          }
          subscription.add(
            notifier$.subscribe({
              next: () => {
                if (innerSub) {
                  subscribeForRetryWhen();
                } else {
                  // If we don't have an innerSub yet, that's because the inner subscription
                  // call hasn't even returned yet. We've arrived here synchronously.
                  // So we flag that we want to resub, such that we can ensure teardown
                  // happens before we resubscribe.
                  syncResub = true;
                }
              },
              error: (err) => subscriber.error(err),
              complete: () => subscriber.complete(),
            })
          );
        }
        return errors$;
      };

      const subscribeForRetryWhen = () => {
        innerSub = source.subscribe({
          next: (value) => subscriber.next(value),
          error: (err) => {
            const errors$ = getErrorSubject();
            if (errors$) {
              // We have set up the notifier without error.
              errors$.next(err);
            }
          },
          complete: () => subscriber.complete(),
        });
        if (syncResub) {
          // Ensure that the inner subscription is torn down before
          // moving on to the next subscription in the synchronous case.
          // If we don't do this here, all inner subscriptions will not be
          // torn down until the entire observable is done.
          innerSub.unsubscribe();
          innerSub = null;
          // We may need to do this multiple times, so reset the flag.
          syncResub = false;
          // Resubscribe
          subscribeForRetryWhen();
        } else {
          subscription.add(innerSub);
        }
      };

      // Start the subscription
      subscribeForRetryWhen();

      return subscription;
    });
}
