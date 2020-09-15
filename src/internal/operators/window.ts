/** @prettier */
import { Observable } from '../Observable';
import { OperatorFunction } from '../types';
import { Subject } from '../Subject';
import { Subscriber } from '../Subscriber';
import { lift } from '../util/lift';
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
 * @name window
 */
export function window<T>(windowBoundaries: Observable<any>): OperatorFunction<T, Observable<T>> {
  return (source: Observable<T>) =>
    lift(source, function (this: Subscriber<Observable<T>>, source: Observable<T>) {
      const subscriber = this;
      let window = new Subject<T>();

      subscriber.next(window.asObservable());

      const windowSubscribe = (source: Observable<any>, next: (value: any) => void) =>
        source.subscribe(
          new OperatorSubscriber(
            subscriber,
            next,
            (err: any) => {
              window.error(err);
              subscriber.error(err);
            },
            () => {
              window.complete();
              subscriber.complete();
            },
            () => {
              window?.unsubscribe();
              window = null!;
            }
          )
        );

      windowSubscribe(source, (value) => window.next(value));
      windowSubscribe(windowBoundaries, () => {
        window.complete();
        subscriber.next((window = new Subject()));
      });
    });
}
