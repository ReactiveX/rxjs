/** @prettier */
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { async } from '../scheduler/async';
import { Observable } from '../Observable';
import { isValidDate } from '../util/isDate';
import { ObservableInput, OperatorFunction, SchedulerAction, SchedulerLike, TeardownLogic } from '../types';
import { lift } from '../util/lift';
import { Subscription } from '../Subscription';
import { SimpleOuterSubscriber, innerSubscribe, SimpleInnerSubscriber } from '../innerSubscribe';

export interface TimeoutConfig {
  /**
   * The time allowed between values from the source before timeout is triggered.
   */
  each?: number;

  /**
   * The relative time as a `number` in milliseconds, or a specific time as a `Date` object,
   * by which the first value must arrive from the source before timeout is triggered.
   */
  first?: number | Date;

  /**
   * The scheduler to use with time-related operations within this operator. Defaults to {@link asyncScheduler}
   */
  scheduler?: SchedulerLike;

  /**
   * Optional additional metadata you can provide to code that handles
   * the timeout, will be provided through the {@link TimeoutError}.
   * This can be used to help identify the source of a timeout or pass along
   * other information related to the timeout.
   */
  meta?: any;
}

export interface TimeoutInfo<T> {
  /** Optional metadata that was provided to the timeout configuration. */
  meta: any;
  /** The number of messages seen before the timeout */
  seen: number;
  /** The last message seen */
  lastValue: T | null;
}

export interface TimeoutWithConfig<T, R> extends TimeoutConfig {
  /**
   * A factory used to create observable to switch to when timeout occurs. Provides
   * some information about the source observable's emissions and what delay or
   * exact time triggered the timeout.
   */
  switchTo: (info: TimeoutInfo<T>) => ObservableInput<R>;

  /**
   * Optional additional metadata that will be provided to the `switchTo` factory
   * via the {@link TimeoutInfo}. This can be used to help identify the source
   * of a timeout or pass along other information related to the timeout.
   */
  meta?: any;
}

export function timeoutWith<T, R>(config: TimeoutWithConfig<T, R>): OperatorFunction<T, T | R>;

/**
 * @param due The exact time, as a `Date`, at which the timeout will be triggered if the first value does not arrive.
 * @param withObservable The observable to switch to when timeout occurs.
 * @param scheduler The scheduler to use with time-related operations within this operator. Defaults to {@link asyncScheduler}
 * @deprecated This will be removed in v8. Use the configuration object instead: `timeoutWith(someDate, a$, scheduler)` -> `timeoutWith({ first: someDate, switchTo: a$, scheduler })`
 */
export function timeoutWith<T, R>(due: Date, withObservable: ObservableInput<R>, scheduler?: SchedulerLike): OperatorFunction<T, T | R>;

/**
 * @param due The time allowed between values from the source before timeout is triggered.
 * @param withObservable The observable to switch to when timeout occurs.
 * @param scheduler The scheduler to use with time-related operations within this operator. Defaults to {@link asyncScheduler}
 * @deprecated This will be removed in v8. Use the configuration object instead: `timeoutWith(100, a$, scheduler)` -> `timeoutWith({ each: 100, switchTo: a$, scheduler })`
 */
export function timeoutWith<T, R>(due: number, withObservable: ObservableInput<R>, scheduler?: SchedulerLike): OperatorFunction<T, T | R>;

/**
 *
 * Switches to a different observable given a
 *
 * <span class="informal">It's a version of `timeout` operator that let's you specify fallback Observable.</span>
 *
 * ![](timeoutWith.png)
 *
 * `timeoutWith` is a variation of `timeout` operator. It behaves exactly the same,
 * still accepting as a first argument either a number or a Date, which control - respectively -
 * when values of source Observable should be emitted or when it should complete.
 *
 * The only difference is that it accepts a second, required parameter. This parameter
 * should be an Observable which will be subscribed when source Observable fails any timeout check.
 * So whenever regular `timeout` would emit an error, `timeoutWith` will instead start re-emitting
 * values from second Observable. Note that this fallback Observable is not checked for timeouts
 * itself, so it can emit values and complete at arbitrary points in time. From the moment of a second
 * subscription, Observable returned from `timeoutWith` simply mirrors fallback stream. When that
 * stream completes, it completes as well.
 *
 * Scheduler, which in case of `timeout` is provided as as second argument, can be still provided
 * here - as a third, optional parameter. It still is used to schedule timeout checks and -
 * as a consequence - when second Observable will be subscribed, since subscription happens
 * immediately after failing check.
 *
 * ## Example
 * Add fallback observable
 * ```ts
 * import { interval } from 'rxjs';
 * import { timeoutWith } from 'rxjs/operators';
 *
 * const seconds = interval(1000);
 * const minutes = interval(60 * 1000);
 *
 * seconds.pipe(timeoutWith(900, minutes))
 *   .subscribe(
 *     value => console.log(value), // After 900ms, will start emitting `minutes`,
 *                                  // since first value of `seconds` will not arrive fast enough.
 *     err => console.log(err),     // Would be called after 900ms in case of `timeout`,
 *                                  // but here will never be called.
 *   );
 * ```
 */
export function timeoutWith<T, R>(
  dueOrConfig: number | Date | TimeoutWithConfig<T, R>,
  withObservable?: ObservableInput<R>,
  scheduler?: SchedulerLike
): OperatorFunction<T, T | R> {
  return (source: Observable<T>) => {
    let first: number | Date | undefined;
    let each: number | undefined = undefined;
    let switchTo: (info: TimeoutInfo<T>) => ObservableInput<R>;
    let meta: any;
    scheduler = scheduler ?? async;

    if (isValidDate(dueOrConfig)) {
      first = dueOrConfig;
      if (withObservable) {
        switchTo = () => withObservable;
      } else {
        throw new TypeError('No observable provided to switch to');
      }
    } else if (typeof dueOrConfig === 'number') {
      each = dueOrConfig;
      if (withObservable) {
        switchTo = () => withObservable;
      } else {
        throw new TypeError('No observable provided to switch to');
      }
    } else {
      first = dueOrConfig.first;
      each = dueOrConfig.each;
      switchTo = dueOrConfig.switchTo;
      scheduler = dueOrConfig.scheduler || async;
      meta = dueOrConfig.meta ?? null;
    }

    if (first == null && each == null) {
      // Ensure timeout was provided at runtime.
      throw new TypeError('No timeout provided.');
    }

    return lift(source, new TimeoutWithOperator(first, each, switchTo, scheduler, meta));
  };
}

class TimeoutWithOperator<T, R> implements Operator<T, R> {
  constructor(
    private first: number | Date | undefined,
    private each: number | undefined,
    private switchTo: (info: TimeoutInfo<T>) => ObservableInput<R>,
    private scheduler: SchedulerLike,
    private meta: any
  ) {}

  call(subscriber: Subscriber<T | R>, source: any): TeardownLogic {
    return source.subscribe(new TimeoutWithSubscriber(subscriber, this.first, this.each, this.switchTo, this.scheduler, this.meta));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class TimeoutWithSubscriber<T, R> extends SimpleOuterSubscriber<T, R> {
  private _timerSubscription?: Subscription;
  private lastValue?: T;
  private seen = 0;

  constructor(
    destination: Subscriber<T>,
    first: number | Date | undefined,
    private each: number | undefined,
    private switchTo: (info: TimeoutInfo<T>) => ObservableInput<R>,
    private scheduler: SchedulerLike,
    private meta: any
  ) {
    super(destination);

    let firstTimer: number;

    if (first != null) {
      if (typeof first === 'number') {
        firstTimer = first;
      } else {
        firstTimer = +first - scheduler.now();
      }
    } else {
      firstTimer = each!;
    }

    this.startTimer(firstTimer);
  }

  private startTimer(delay: number): void {
    this._timerSubscription?.unsubscribe();
    this._timerSubscription = this.scheduler.schedule(() => {
      const { meta, seen, lastValue = null } = this;
      let result: ObservableInput<R>;
      try {
        result = this.switchTo({
          meta,
          seen,
          lastValue,
        });
      } catch (err) {
        this.destination.error(err);
        return;
      }
      this._unsubscribeAndRecycle();
      this.add(innerSubscribe(result, new SimpleInnerSubscriber(this)));
    }, delay);
    this.add(this._timerSubscription);
  }

  protected _next(value: T): void {
    const { each } = this;
    this.seen++;
    this.lastValue = value;
    if (each != null) {
      this.startTimer(each);
    }
    super._next(value);
  }
}
