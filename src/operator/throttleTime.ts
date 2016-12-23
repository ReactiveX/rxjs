import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { IScheduler } from '../Scheduler';
import { Subscription, TeardownLogic } from '../Subscription';
import { async } from '../scheduler/async';
import { Observable } from '../Observable';

/**
 * Emits a value from the source Observable, then ignores subsequent source
 * values for `duration` milliseconds, then repeats this process.
 *
 * <span class="informal">Lets a value pass, then ignores source values for the
 * next `duration` milliseconds.</span>
 *
 * <img src="./img/throttleTime.png" width="100%">
 *
 * `throttleTime` emits the source Observable values on the output Observable
 * when its internal timer is disabled, and ignores source values when the timer
 * is enabled. Initially, the timer is disabled. As soon as the first source
 * value arrives, it is forwarded to the output Observable, and then the timer
 * is enabled. After `duration` milliseconds (or the time unit determined
 * internally by the optional `scheduler`) has passed, the timer is disabled,
 * and this process repeats for the next source value. Optionally takes a
 * {@link IScheduler} for managing timers.
 *
 * @example <caption>Emit clicks at a rate of at most one click per second</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.throttleTime(1000);
 * result.subscribe(x => console.log(x));
 *
 * @see {@link auditTime}
 * @see {@link debounceTime}
 * @see {@link delay}
 * @see {@link sampleTime}
 * @see {@link throttle}
 *
 * @param {number} duration Time to wait before emitting another value after
 * emitting the last value, measured in milliseconds or the time unit determined
 * internally by the optional `scheduler`.
 * @param {Scheduler} [scheduler=async] The {@link IScheduler} to use for
 * managing the timers that handle the sampling.
 * @return {Observable<T>} An Observable that performs the throttle operation to
 * limit the rate of emissions from the source.
 * @method throttleTime
 * @owner Observable
 */
export function throttleTime<T>(this: Observable<T>, duration: number, scheduler: IScheduler = async): Observable<T> {
  return this.lift(new ThrottleTimeOperator(duration, scheduler));
}

class ThrottleTimeOperator<T> implements Operator<T, T> {
  constructor(private duration: number,
              private scheduler: IScheduler) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new ThrottleTimeSubscriber(subscriber, this.duration, this.scheduler));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class ThrottleTimeSubscriber<T> extends Subscriber<T> {
  private throttled: Subscription;

  constructor(destination: Subscriber<T>,
              private duration: number,
              private scheduler: IScheduler) {
    super(destination);
  }

  protected _next(value: T) {
    if (!this.throttled) {
      this.add(this.throttled = this.scheduler.schedule(dispatchNext, this.duration, { subscriber: this }));
      this.destination.next(value);
    }
  }

  clearThrottle() {
    const throttled = this.throttled;
    if (throttled) {
      throttled.unsubscribe();
      this.remove(throttled);
      this.throttled = null;
    }
  }
}

interface DispatchArg<T> {
  subscriber: ThrottleTimeSubscriber<T>;
}

function dispatchNext<T>(arg: DispatchArg<T>) {
  const { subscriber } = arg;
  subscriber.clearThrottle();
}
