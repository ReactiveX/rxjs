import { timer } from './timer';
import { IScheduler } from '../Scheduler';
import { async } from '../scheduler/async';
/* tslint:disable:no-unused-variable */
import { Observable } from '../Observable';
/* tslint:enable:no-unused-variable */

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
   * @example <caption>Emits ascending numbers, one every second (1000ms)</caption>
   * var numbers = Rx.Observable.interval(1000);
   * numbers.subscribe(x => console.log(x));
   *
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
export const interval = (period: number = 0, scheduler: IScheduler = async) => {
  const p = period < 0 ? 0 : period;
  return timer(p, p, scheduler);
};
