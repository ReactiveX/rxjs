import { Subject } from '../Subject';
import { Operator } from '../Operator';
import { async } from '../scheduler/async';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { isNumeric } from '../util/isNumeric';
import { isScheduler } from '../util/isScheduler';
import { OperatorFunction, SchedulerLike, SchedulerAction } from '../types';

export function windowTime<T>(windowTimeSpan: number,
                              scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;
export function windowTime<T>(windowTimeSpan: number,
                              windowCreationInterval: number,
                              scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;
export function windowTime<T>(windowTimeSpan: number,
                              windowCreationInterval: number,
                              maxWindowSize: number,
                              scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;
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
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { windowTime, map, mergeAll, take } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   windowTime(1000),
 *   map(win => win.pipe(take(2))), // each window has at most 2 emissions
 *   mergeAll(),                    // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * Every 5 seconds start a window 1 second long, and emit at most 2 click events per window
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { windowTime, map, mergeAll, take } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   windowTime(1000, 5000),
 *   map(win => win.pipe(take(2))), // each window has at most 2 emissions
 *   mergeAll(),                    // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * Same as example above but with maxWindowCount instead of take
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { windowTime, mergeAll } from 'rxjs/operators';
 *
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
 * @param windowTimeSpan The amount of time to fill each window.
 * @param windowCreationInterval The interval at which to start new
 * windows.
 * @param maxWindowSize Max number of
 * values each window can emit before completion.
 * @param scheduler The scheduler on which to schedule the
 * intervals that determine window boundaries.
 * @returnAn observable of windows, which in turn are Observables.
 */
export function windowTime<T>(windowTimeSpan: number): OperatorFunction<T, Observable<T>> {
  let scheduler: SchedulerLike = async;
  let windowCreationInterval: number | null = null;
  let maxWindowSize: number = Infinity;

  if (isScheduler(arguments[3])) {
    scheduler = arguments[3];
  }

  if (isScheduler(arguments[2])) {
    scheduler = arguments[2];
  } else if (isNumeric(arguments[2])) {
    maxWindowSize = Number(arguments[2]);
  }

  if (isScheduler(arguments[1])) {
    scheduler = arguments[1];
  } else if (isNumeric(arguments[1])) {
    windowCreationInterval = Number(arguments[1]);
  }

  return function windowTimeOperatorFunction(source: Observable<T>) {
    return source.lift(new WindowTimeOperator<T>(windowTimeSpan, windowCreationInterval, maxWindowSize, scheduler));
  };
}

class WindowTimeOperator<T> implements Operator<T, Observable<T>> {

  constructor(private windowTimeSpan: number,
              private windowCreationInterval: number | null,
              private maxWindowSize: number,
              private scheduler: SchedulerLike) {
  }

  call(subscriber: Subscriber<Observable<T>>, source: any): any {
    return source.subscribe(new WindowTimeSubscriber(
      subscriber, this.windowTimeSpan, this.windowCreationInterval, this.maxWindowSize, this.scheduler
    ));
  }
}

interface CreationState<T> {
  windowTimeSpan: number;
  windowCreationInterval: number;
  subscriber: WindowTimeSubscriber<T>;
  scheduler: SchedulerLike;
}

interface TimeSpanOnlyState<T> {
    window: CountedSubject<T>;
    windowTimeSpan: number;
    subscriber: WindowTimeSubscriber<T>;
  }

interface CloseWindowContext<T> {
  action: SchedulerAction<CreationState<T>>;
  subscription: Subscription;
}

interface CloseState<T> {
  subscriber: WindowTimeSubscriber<T>;
  window: CountedSubject<T>;
  context: CloseWindowContext<T>;
}

class CountedSubject<T> extends Subject<T> {
  private _numberOfNextedValues: number = 0;

  next(value: T): void {
    this._numberOfNextedValues++;
    super.next(value);
  }

  get numberOfNextedValues(): number {
    return this._numberOfNextedValues;
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class WindowTimeSubscriber<T> extends Subscriber<T> {
  private windows: CountedSubject<T>[] = [];

  constructor(protected destination: Subscriber<Observable<T>>,
              windowTimeSpan: number,
              windowCreationInterval: number | null,
              private maxWindowSize: number,
              scheduler: SchedulerLike) {
    super(destination);

    const window = this.openWindow();
    if (windowCreationInterval !== null && windowCreationInterval >= 0) {
      const closeState: CloseState<T> = { subscriber: this, window, context: null! };
      const creationState: CreationState<T> = { windowTimeSpan, windowCreationInterval, subscriber: this, scheduler };
      this.add(scheduler.schedule<CloseState<T>>(dispatchWindowClose as any, windowTimeSpan, closeState));
      this.add(scheduler.schedule<CreationState<T>>(dispatchWindowCreation as any, windowCreationInterval, creationState));
    } else {
      const timeSpanOnlyState: TimeSpanOnlyState<T> = { subscriber: this, window, windowTimeSpan };
      this.add(scheduler.schedule<TimeSpanOnlyState<T>>(dispatchWindowTimeSpanOnly as any, windowTimeSpan, timeSpanOnlyState));
    }
  }

  protected _next(value: T): void {
    // If we have a max window size, we might end up mutating the
    // array while we're iterating over it. If that's the case, we'll
    // copy it, otherwise, we don't just to save memory allocation.
    const windows = this.maxWindowSize < Infinity ? this.windows.slice() : this.windows;
    const len = windows.length;
    for (let i = 0; i < len; i++) {
      const window = windows[i];
      if (!window.closed) {
        window.next(value);
        if (this.maxWindowSize <= window.numberOfNextedValues) {
          // mutation may occur here.
          this.closeWindow(window);
        }
      }
    }
  }

  protected _error(err: any): void {
    const windows = this.windows;
    while (windows.length > 0) {
      windows.shift()!.error(err);
    }
    this.destination.error(err);
  }

  protected _complete(): void {
    const windows = this.windows;
    while (windows.length > 0) {
      windows.shift()!.complete();
    }
    this.destination.complete();
  }

  public openWindow(): CountedSubject<T> {
    const window = new CountedSubject<T>();
    this.windows.push(window);
    const destination = this.destination;
    destination.next(window);
    return window;
  }

  public closeWindow(window: CountedSubject<T>): void {
    const index = this.windows.indexOf(window);
    // All closed windows should have been removed,
    // we don't need to call complete unless they're found.
    if (index >= 0) {
      window.complete();
      this.windows.splice(index, 1);
    }
  }
}

function dispatchWindowTimeSpanOnly<T>(this: SchedulerAction<TimeSpanOnlyState<T>>, state: TimeSpanOnlyState<T>): void {
  const { subscriber, windowTimeSpan, window } = state;
  if (window) {
    subscriber.closeWindow(window);
  }
  state.window = subscriber.openWindow();
  this.schedule(state, windowTimeSpan);
}

function dispatchWindowCreation<T>(this: SchedulerAction<CreationState<T>>, state: CreationState<T>): void {
  const { windowTimeSpan, subscriber, scheduler, windowCreationInterval } = state;
  const window = subscriber.openWindow();
  const action = this;
  let context: CloseWindowContext<T> = { action, subscription: null! };
  const timeSpanState: CloseState<T> = { subscriber, window, context };
  context.subscription = scheduler.schedule<CloseState<T>>(dispatchWindowClose as any, windowTimeSpan, timeSpanState);
  action.add(context.subscription);
  action.schedule(state, windowCreationInterval);
}

function dispatchWindowClose<T>(this: SchedulerAction<CloseState<T>>, state: CloseState<T>): void {
  const { subscriber, window, context } = state;
  if (context && context.action && context.subscription) {
    context.action.remove(context.subscription);
  }
  subscriber.closeWindow(window);
}
