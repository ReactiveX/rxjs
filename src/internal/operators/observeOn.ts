/** @prettier */
import { MonoTypeOperatorFunction, SchedulerLike } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 *
 * Re-emits all notifications from source Observable with specified scheduler.
 *
 * <span class="informal">Ensure a specific scheduler is used, from outside of an Observable.</span>
 *
 * `observeOn` is an operator that accepts a scheduler as a first parameter, which will be used to reschedule
 * notifications emitted by the source Observable. It might be useful, if you do not have control over
 * internal scheduler of a given Observable, but want to control when its values are emitted nevertheless.
 *
 * Returned Observable emits the same notifications (nexted values, complete and error events) as the source Observable,
 * but rescheduled with provided scheduler. Note that this doesn't mean that source Observables internal
 * scheduler will be replaced in any way. Original scheduler still will be used, but when the source Observable emits
 * notification, it will be immediately scheduled again - this time with scheduler passed to `observeOn`.
 * An anti-pattern would be calling `observeOn` on Observable that emits lots of values synchronously, to split
 * that emissions into asynchronous chunks. For this to happen, scheduler would have to be passed into the source
 * Observable directly (usually into the operator that creates it). `observeOn` simply delays notifications a
 * little bit more, to ensure that they are emitted at expected moments.
 *
 * As a matter of fact, `observeOn` accepts second parameter, which specifies in milliseconds with what delay notifications
 * will be emitted. The main difference between {@link delay} operator and `observeOn` is that `observeOn`
 * will delay all notifications - including error notifications - while `delay` will pass through error
 * from source Observable immediately when it is emitted. In general it is highly recommended to use `delay` operator
 * for any kind of delaying of values in the stream, while using `observeOn` to specify which scheduler should be used
 * for notification emissions in general.
 *
 * ## Example
 *
 * Ensure values in subscribe are called just before browser repaint.
 *
 * ```ts
 * import { interval, animationFrameScheduler } from 'rxjs';
 * import { observeOn } from 'rxjs/operators';
 *
 * const someDiv = document.querySelector("#someDiv");
 * const intervals = interval(10);                // Intervals are scheduled
 *                                                // with async scheduler by default...
 * intervals.pipe(
 *   observeOn(animationFrameScheduler),          // ...but we will observe on animationFrame
 * )                                              // scheduler to ensure smooth animation.
 * .subscribe(val => {
 *   someDiv.style.height = val + 'px';
 * });
 * ```
 *
 * @see {@link delay}
 *
 * @param scheduler Scheduler that will be used to reschedule notifications from source Observable.
 * @param delay Number of milliseconds that states with what delay every notification should be rescheduled.
 * @return A function that returns an Observable that emits the same
 * notifications as the source Observable, but with provided scheduler.
 */
export function observeOn<T>(scheduler: SchedulerLike, delay = 0): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    /**
     * Executes work with the provided scheduler and provided delay.
     * This exists primarily to manage the Actions being scheduled to make
     * sure they are removed from the parent Subscription.
     * Actions will be retained in memory until the parent Subscription finalizes
     * because they could be rescheduled at any time. We know the
     * actions in this operator are NOT going to be rescheduled, so
     * we want to make sure they're removed as soon as possible.
     * @param execute The work to schedule with the scheduler provided
     */
    const schedule = (execute: () => void) => {
      let syncUnsub = false;
      const actionSubs = scheduler.schedule(() => {
        if (actionSubs) {
          // The action fired asynchronously, so we have a subscription
          // we can unsubscribe before continuing. Unsubscription will
          // remove the Action/Subscription from the parent (subscriber).
          actionSubs.unsubscribe();
        } else {
          // The action fired synchronously, so we don't have a
          // subscription we can unsubscribe just yet. Flag that
          // we want to unsubscribe when we do get it.
          syncUnsub = true;
        }
        // Execute the work required.
        execute();
      }, delay);

      if (syncUnsub) {
        // The action above fired synchronously, so we can tear it down.
        actionSubs.unsubscribe();
      } else {
        // The action hasn't fired yet. It's asynchronous. So we should
        // add it to our subscriber, which is the parent Subscription,
        // so it is unsubscribed if our consumer unsubscribes.
        subscriber.add(actionSubs);
      }
    };

    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value) => schedule(() => subscriber.next(value)),
        () => schedule(() => subscriber.complete()),
        (err) => schedule(() => subscriber.error(err))
      )
    );
  });
}
