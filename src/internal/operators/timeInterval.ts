
import { Observable } from '../Observable';
import { async } from '../scheduler/async';
import { SchedulerLike, OperatorFunction } from '../types';
import { scan } from './scan';
import { defer } from '../observable/defer';
import { map } from './map';

/**
 *
 * emit time interval between current value with last value
 *
 *
 * ![](timeinterval.png)
 *
 * `timeinterval` operator accepts as an argument as the Scheduler, default value is Scheduler.async
 *
 * ## Examples
 * emit inteval between current value with the last value
 *
 * ```javascript
 * const seconds = interval(1000);
 *
 * seconds.pipe(timeinterval())
 * .subscribe(
 *     value => console.log(value), 
 *     err => console.log(err),     
 * );
 *
 * seconds.pipe(timeout(900))
 * .subscribe(
 *     value => console.log(value),
 *     err => console.log(err),     
 * );                              
 * // {value: 0, interval: 1001}
 * // {value: 1, interval: 1003}
 * // {value: 2, interval: 997}
 * ```
 * 
 * @param {SchedulerLike} [scheduler] Scheduler controlling when timeout checks occur.
 * @return {Observable<T>} Observable that emit infomation about value and interval
 * @method timeInterval
 * @owner Observable
 */
export function timeInterval<T>(scheduler: SchedulerLike = async): OperatorFunction<T, TimeInterval<T>> {
  return (source: Observable<T>) => defer(() => {
    return source.pipe(
      // HACK: the typings seem off with scan
      scan(
        ({ current }, value) => ({ value, current: scheduler.now(), last: current }),
        { current: scheduler.now(), value: undefined,  last: undefined }
      ) as any,
      map<any, TimeInterval<T>>(({ current, last, value }) => new TimeInterval(value, current - last)),
    );
  });
}

export class TimeInterval<T> {
  constructor(public value: T, public interval: number) {}
}
