import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { Subscription } from '../Subscription';

import { MonoTypeOperatorFunction, TeardownLogic } from '../types';
import { lift } from '../util/lift';
import { SimpleOuterSubscriber, innerSubscribe, SimpleInnerSubscriber } from '../innerSubscribe';

/**
 * Returns an Observable that mirrors the source Observable with the exception of a `complete`. If the source
 * Observable calls `complete`, this method will emit to the Observable returned from `notifier`. If that Observable
 * calls `complete` or `error`, then this method will call `complete` or `error` on the child subscription. Otherwise
 * this method will resubscribe to the source Observable.
 *
 * ![](repeatWhen.png)
 *
 * ## Example
 * Repeat a message stream on click
 * ```ts
 * import { of, fromEvent } from 'rxjs';
 * import { repeatWhen } from 'rxjs/operators';
 *
 * const source = of('Repeat message');
 * const documentClick$ = fromEvent(document, 'click');
 *
 * source.pipe(repeatWhen(() => documentClick$)
 * ).subscribe(data => console.log(data))
 * ```
 * @see {@link repeat}
 * @see {@link retry}
 * @see {@link retryWhen}
 *
 * @param {function(notifications: Observable): Observable} notifier - Receives an Observable of notifications with
 * which a user can `complete` or `error`, aborting the repetition.
 * @return {Observable} The source Observable modified with repeat logic.
 * @name repeatWhen
 */
export function repeatWhen<T>(notifier: (notifications: Observable<void>) => Observable<any>): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => lift(source, function (this: Subscriber<T>, source: Observable<T>) {
    const subscriber = this;
    const subscription = new Subscription();
    let innerSub: Subscription | null;
    let syncResub = false;
    let completions$: Subject<void>;
    let isNotifierComplete = false;
    let isMainComplete = false;

    /**
     * Gets the subject to send errors through. If it doesn't exist,
     * we know we need to setup the notifier.
     */
    const getCompletionSubject = () => {
      if (!completions$) {
        completions$ = new Subject();
        let notifier$: Observable<any>;
        // The notifier is a user-provided function, so we need to do
        // some error handling.
        try {
          notifier$ = notifier(completions$);
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
                subscribeForRepeatWhen();
              } else {
                // If we don't have an innerSub yet, that's because the inner subscription
                // call hasn't even returned yet. We've arrived here synchronously.
                // So we flag that we want to resub, such that we can ensure teardown
                // happens before we resubscribe.
                syncResub = true;
              }
            },
            error: (err) => subscriber.error(err),
            complete: () => {
              isNotifierComplete = true;
              if (isMainComplete) {
                subscriber.complete();
              }
            },
          })
        );
      }
      return completions$;
    };

    const subscribeForRepeatWhen = () => {
      isMainComplete = false;
      innerSub = source.subscribe({
        next: (value) => subscriber.next(value),
        error: (err) => subscriber.error(err),
        complete: () => {
          isMainComplete = true;
          if (isNotifierComplete) {
            subscriber.complete();
          } else {
            const completions$ = getCompletionSubject();
            if (completions$) {
              // We have set up the notifier without error.
              completions$.next();
            }
          }
        },
      });
      if (syncResub) {
        // Ensure that the inner subscription is torn down before
        // moving on to the next subscription in the synchronous case.
        // If we don't do this here, all inner subscriptions will not be
        // torn down until the entire observable is done.
        innerSub.unsubscribe();
        innerSub = null;
        // We may need to do this multiple times, so reset the flags.
        syncResub = false;
        // Resubscribe
        subscribeForRepeatWhen();
      } else {
        subscription.add(innerSub);
      }
    };

    // Start the subscription
    subscribeForRepeatWhen();

    return subscription;
  });
}
