import { Observable } from '../Observable';
import { async } from '../scheduler/async';
import { SchedulerAction, SchedulerLike } from '../types';
import { isNumeric } from '../util/isNumeric';
import { Subscriber } from '../Subscriber';

/**
 * Creates an Observable that emits sequential numbers every specified
 * interval of time, on a specified IScheduler.
 *
 * <span class="informal">Emits incremental numbers periodically in time.
 * </span>
 *
 * <img src="./img/interval.png" width="100%">
 *
 * `interval` returns an Observable that emits an infinite sequence of
 * ascending integers, with a constant interval of time of your choosing
 * between those emissions. The first emission is not sent immediately, but
 * only after the first period has passed. By default, this operator uses the
 * `async` IScheduler to provide a notion of time, but you may pass any
 * IScheduler to it.
 *
 * ## Example
 * Emits ascending numbers, one every second (1000ms)
 * ```javascript
 * const numbers = interval(1000);
 * numbers.subscribe(x => console.log(x));
 * ```javascript
 * @see {@link timer}
 * @see {@link delay}
 *
 * @param {number} [period=0] The interval size in milliseconds (by default)
 * or the time unit determined by the scheduler's clock.
 * @param {Scheduler} [scheduler=async] The IScheduler to use for scheduling
 * the emission of values, and providing a notion of "time".
 * @return {Observable} An Observable that emits a sequential number each time
 * interval.
 * @static true
 * @name interval
 * @owner Observable
 */
export function interval(period = 0,
                         scheduler: SchedulerLike = async): Observable<number> {
  if (!isNumeric(period) || period < 0) {
    period = 0;
  }

  if (!scheduler || typeof scheduler.schedule !== 'function') {
    scheduler = async;
  }

  return new Observable<number>(subscriber => {
    subscriber.add(
      scheduler.schedule(dispatch, period, { subscriber, counter: 0, period })
    );
    return subscriber;
  });
}

function dispatch(this: SchedulerAction<IntervalState>, state: IntervalState) {
  const { subscriber, counter, period } = state;
  subscriber.next(counter);
  this.schedule({ subscriber, counter: counter + 1, period }, period);
}

interface IntervalState {
  subscriber: Subscriber<number>;
  counter: number;
  period: number;
}
