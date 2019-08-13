import { Observable } from '../Observable';
import { SchedulerLike } from '../types';

/**
 * The same Observable instance returned by any call to {@link empty} without a
 * `scheduler`. It is preferrable to use this over `empty()`.
 * 
 * ## Examples
 * ### Emit the number 7, then complete
 * ```ts
 * import { EMPTY } from 'rxjs';
 * import { startWith } from 'rxjs/operators';
 * 
 * const result = EMPTY.pipe(startWith(7));
 * result.subscribe(x => console.log(x));
 * ```
 * 
 * ### Map and flatten only odd numbers to the sequence 'a', 'b', 'c'
 * ```ts
 * import { EMPTY, interval, of } from 'rxjs';
 * import { mergeMap } from 'rxjs/operators';
 * 
 * const interval$ = interval(1000);
 * 
 * const result = interval$.pipe(
 *   mergeMap(x => x % 2 === 1 ? of('a', 'b', 'c') : EMPTY),
 * );
 * result.subscribe(x => console.log(x));
 * 
 * // Results in the following to the console:
 * // x is equal to the count on the interval eg(0,1,2,3,...)
 * // x will occur every 1000ms
 * // if x % 2 is equal to 1 print abc
 * // if x % 2 is not equal to 1 nothing will be output
 * ```
 * 
 */
export const EMPTY = new Observable<never>(subscriber => subscriber.complete());

/**
 * Creates an Observable that emits no items to the Observer and immediately
 * emits a complete notification.
 *
 * <span class="informal">Just emits 'complete', and nothing else.
 * </span>
 *
 * ![](empty.png)
 *
 * This static operator is useful for creating a simple Observable that only
 * emits the complete notification. It can be used for composing with other
 * Observables, such as in a {@link mergeMap}.
 *
 * ## Examples
 * ### Emit the number 7, then complete
 * ```ts
 * import { empty } from 'rxjs';
 * import { startWith } from 'rxjs/operators';
 *
 * const result = empty().pipe(startWith(7));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * ### Map and flatten only odd numbers to the sequence 'a', 'b', 'c'
 * ```ts
 * import { empty, interval, of } from 'rxjs';
 * import { mergeMap } from 'rxjs/operators';
 *
 * const interval$ = interval(1000);
 * const result = interval$.pipe(
 *   mergeMap(x => x % 2 === 1 ? of('a', 'b', 'c') : empty()),
 * );
 * result.subscribe(x => console.log(x));
 *
 * // Results in the following to the console:
 * // x is equal to the count on the interval eg(0,1,2,3,...)
 * // x will occur every 1000ms
 * // if x % 2 is equal to 1 print abc
 * // if x % 2 is not equal to 1 nothing will be output
 * ```
 *
 * @see {@link Observable}
 * @see {@link never}
 * @see {@link of}
 * @see {@link throwError}
 *
 * @param scheduler A {@link SchedulerLike} to use for scheduling
 * the emission of the complete notification.
 * @return An "empty" Observable: emits only the complete
 * notification.
 * @deprecated Deprecated in favor of using {@link index/EMPTY} constant, or {@link scheduled} (e.g. `scheduled([], scheduler)`)
 */
export function empty(scheduler?: SchedulerLike) {
  return scheduler ? emptyScheduled(scheduler) : EMPTY;
}

function emptyScheduled(scheduler: SchedulerLike) {
  return new Observable<never>(subscriber => scheduler.schedule(() => subscriber.complete()));
}
