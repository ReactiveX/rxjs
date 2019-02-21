import { async } from '../scheduler/async';
import { isDate } from '../util/isDate';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Notification } from '../Notification';
import { Observable } from '../Observable';
import { MonoTypeOperatorFunction, SchedulerLike, TeardownLogic } from '../types';

/**
 * Delays the emission of items from the source Observable by a given timeout or
 * until a given Date.
 *
 * <span class="informal">Time shifts each item by some specified amount of
 * milliseconds.</span>
 *
 * ![](delay.png)
 *
 * If the delay argument is a Number, this operator time shifts the source
 * Observable by that amount of time expressed in milliseconds. The relative
 * time intervals between the values are preserved.
 *
 * If the delay argument is a Date, this operator time shifts the start of the
 * Observable execution until the given date occurs.
 *
 * ## Examples
 * Delay each click by one second
 * ```javascript
 * import { fromEvent } from 'rxjs';
 * import { delay } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const delayedClicks = clicks.pipe(delay(1000)); // each click emitted after 1 second
 * delayedClicks.subscribe(x => console.log(x));
 * ```
 *
 * Delay all clicks until a future date happens
 * ```javascript
 * import { fromEvent } from 'rxjs';
 * import { delay } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const date = new Date('March 15, 2050 12:00:00'); // in the future
 * const delayedClicks = clicks.pipe(delay(date)); // click emitted only after that date
 * delayedClicks.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link debounceTime}
 * @see {@link delayWhen}
 *
 * @param {number|Date} delay The delay duration in milliseconds (a `number`) or
 * a `Date` until which the emission of the source items is delayed.
 * @param {SchedulerLike} [scheduler=async] The {@link SchedulerLike} to use for
 * managing the timers that handle the time-shift for each item.
 * @return {Observable} An Observable that delays the emissions of the source
 * Observable by the specified timeout or Date.
 * @method delay
 * @owner Observable
 */
export function delay<T>(delay: number|Date,
                         scheduler: SchedulerLike = async): MonoTypeOperatorFunction<T> {
  const absoluteDelay = isDate(delay);
  const delayFor = absoluteDelay ? (+delay - scheduler.now()) : Math.abs(<number>delay);
  return (source: Observable<T>) => source.lift(new DelayOperator(delayFor, scheduler));
}

class DelayOperator<T> implements Operator<T, T> {
  constructor(private delay: number,
              private scheduler: SchedulerLike) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new DelaySubscriber(subscriber, this.delay, this.scheduler));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DelaySubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<T>,
              private delay: number,
              private scheduler: SchedulerLike) {
    super(destination);
  }

  private scheduleNotification(notification: Notification<T>): void {
    const destination = this.destination as Subscriber<T>;
    this.scheduler.schedule<DelayState<T>>(dispatch, this.delay, { notification, destination });
  }

  protected _next(value: T) {
    this.scheduleNotification(Notification.createNext(value));
  }

  protected _complete() {
    this.scheduleNotification(Notification.createComplete());
    this.unsubscribe();
  }
}

function dispatch<T>(state: DelayState<T>) {
  const { destination, notification } = state;
  if (!destination.closed) {
    notification.observe(destination);
  }
}

interface DelayState<T> {
  notification: Notification<T>;
  destination: Subscriber<T>;
}
