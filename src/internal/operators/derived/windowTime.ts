import { SchedulerLike, Operation } from "rxjs/internal/types";
import { isScheduler } from "rxjs/internal/util/isScheduler";
import { asyncScheduler } from "rxjs/internal/scheduler/asyncScheduler";
import { Observable } from "rxjs/internal/Observable";
import { windowToggle } from "rxjs/internal/operators/windowToggle";
import { timer } from "rxjs/internal/create/timer";
import { map } from "rxjs/internal/operators/map";
import { take } from "rxjs/internal/operators/take";
import { pipe } from "rxjs/internal/util/pipe";
import { isNumeric } from "rxjs/internal/util/isNumeric";
import { window } from "rxjs/internal/operators/window";

/**
 * Branch out the source Observable values as a nested Observable periodically
 * in time.
 *
 * <span class="informal">It's like {@link bufferTime}, but emits a nested
 * Observable instead of an array.</span>
 *
 * ![](windowTime.png)
 *
 * Returns an Observable that emits windows of items it collects from the source
 * Observable. The output Observable starts a new window periodically, as
 * determined by the `windowCreationInterval` argument. It emits each window
 * after a fixed timespan, specified by the `windowTimeSpan` argument. When the
 * source Observable completes or encounters an error, the output Observable
 * emits the current window and propagates the notification from the source
 * Observable. If `windowCreationInterval` is not provided, the output
 * Observable starts a new window when the previous window of duration
 * `windowTimeSpan` completes. If `maxWindowCount` is provided, each window
 * will emit at most fixed number of values. Window will complete immediately
 * after emitting last value and next one still will open as specified by
 * `windowTimeSpan` and `windowCreationInterval` arguments.
 *
 * ## Examples
 * In every window of 1 second each, emit at most 2 click events
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   windowTime(1000),
 *   map(win => win.take(2)),   // each window has at most 2 emissions
 *   mergeAll(),                // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * Every 5 seconds start a window 1 second long, and emit at most 2 click events per window
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   windowTime(1000, 5000),
 *   map(win => win.take(2)),   // each window has at most 2 emissions
 *   mergeAll(),                // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * Same as example above but with maxWindowCount instead of take
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   windowTime(1000, 5000, 2), // each window has still at most 2 emissions
 *   mergeAll(),                // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link window}
 * @see {@link windowCount}
 * @see {@link windowToggle}
 * @see {@link windowWhen}
 * @see {@link bufferTime}
 *
 * @param {number} windowTimeSpan The amount of time to fill each window.
 * @param {number} [windowCreationInterval] The interval at which to start new
 * windows.
 * @param {number} [maxWindowSize=Number.POSITIVE_INFINITY] Max number of
 * values each window can emit before completion.
 * @param {SchedulerLike} [scheduler=async] The scheduler on which to schedule the
 * intervals that determine window boundaries.
 * @return {Observable<Observable<T>>} An observable of windows, which in turn
 * are Observables.
 * @method windowTime
 * @owner Observable
 */
export function windowTime<T>(windowTimeSpan: number,
  scheduler?: SchedulerLike): Operation<T, Observable<T>>;
export function windowTime<T>(windowTimeSpan: number,
  windowCreationInterval: number,
  scheduler?: SchedulerLike): Operation<T, Observable<T>>;
export function windowTime<T>(windowTimeSpan: number,
  windowCreationInterval: number,
  maxWindowSize: number,
  scheduler?: SchedulerLike): Operation<T, Observable<T>>;

export function windowTime<T>(
  windowTimeSpan: number,
  arg2?: number|SchedulerLike,
  arg3?: number|SchedulerLike,
  arg4?: SchedulerLike
): Operation<T, Observable<T>> {
  let scheduler: SchedulerLike = asyncScheduler;
  let windowCreationInterval: number = null;
  let maxWindowSize = Number.POSITIVE_INFINITY;

  if (isScheduler(arg2)) {
    scheduler = arg2;
  }

  if (isScheduler(arg3)) {
    scheduler = arg3;
  } else if (isNumeric(arg3)) {
    maxWindowSize = arg3;
  }

  if (isScheduler(arg2)) {
    scheduler = arg2;
  } else if (isNumeric(arg2)) {
    windowCreationInterval = arg2;
  }

  const closing = timer(windowTimeSpan, scheduler);

  const windowed: Operation<T, Observable<T>> =
    windowCreationInterval !== null
    ? windowToggle(timer(0, windowCreationInterval, scheduler), () => closing)
    : window(timer(windowTimeSpan, windowTimeSpan, scheduler));

  if (maxWindowSize < Number.POSITIVE_INFINITY) {
    return pipe(
      windowed,
      map(window => window.pipe(take(maxWindowSize))),
    );
  } else {
    return windowed;
  }
}
