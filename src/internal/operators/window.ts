/** @prettier */
import { Observable } from '../Observable';
import { OperatorFunction } from '../types';
import { Subject } from '../Subject';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Branch out the source Observable values as a nested Observable whenever
 * `windowBoundaries` emits.
 *
 * <span class="informal">It's like {@link buffer}, but emits a nested Observable
 * instead of an array.</span>
 *
 * ![](window.png)
 *
 * Returns an Observable that emits windows of items it collects from the source
 * Observable. The output Observable emits connected, non-overlapping
 * windows. It emits the current window and opens a new one whenever the
 * Observable `windowBoundaries` emits an item. Because each window is an
 * Observable, the output is a higher-order Observable.
 *
 * ## Example
 * In every window of 1 second each, emit at most 2 click events
 * ```ts
 * import { fromEvent, interval } from 'rxjs';
 * import { window, mergeAll, map, take } from 'rxjs/operators';
 *
 *  const clicks = fromEvent(document, 'click');
 *  const sec = interval(1000);
 *  const result = clicks.pipe(
 *      window(sec),
 *      map(win => win.pipe(take(2))), // each window has at most 2 emissions
 *      mergeAll(),              // flatten the Observable-of-Observables
 *  );
 *  result.subscribe(x => console.log(x));
 * ```
 * @see {@link windowCount}
 * @see {@link windowTime}
 * @see {@link windowToggle}
 * @see {@link windowWhen}
 * @see {@link buffer}
 *
 * @param {Observable<any>} windowBoundaries An Observable that completes the
 * previous window and starts a new window.
 * @return {Observable<Observable<T>>} An Observable of windows, which are
 * Observables emitting values of the source Observable.
 */
export function window<T>(windowBoundaries: Observable<any>): OperatorFunction<T, Observable<T>> {
  return operate((source, subscriber) => {
    let windowSubject = new Subject<T>();

    subscriber.next(windowSubject.asObservable());

    /**
     * Subscribes to one of our two observables in this operator in the same way,
     * only allowing for different behaviors with the next handler.
     * @param sourceOrNotifier The observable to subscribe to.
     * @param next The next handler to use with the subscription
     */
    const windowSubscribe = (sourceOrNotifier: Observable<any>, next: (value: any) => void) =>
      sourceOrNotifier.subscribe(
        new OperatorSubscriber(
          subscriber,
          next,
          (err: any) => {
            windowSubject.error(err);
            subscriber.error(err);
          },
          () => {
            windowSubject.complete();
            subscriber.complete();
          }
        )
      );

    // Subscribe to our source
    windowSubscribe(source, (value) => windowSubject.next(value));
    // Subscribe to the window boundaries.
    windowSubscribe(windowBoundaries, () => {
      windowSubject.complete();
      subscriber.next((windowSubject = new Subject()));
    });

    // Additional teardown. Note that other teardown and post-subscription logic
    // is encapsulated in the act of a Subscriber subscribing to the observable
    // during the subscribe call. We can return additional teardown here.
    return () => {
      windowSubject.unsubscribe();
      windowSubject = null!;
    };
  });
}
