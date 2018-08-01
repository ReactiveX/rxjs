import { Observable } from '../Observable';
import { fromArray } from '../observable/fromArray';
import { scalar } from '../observable/scalar';
import { empty } from '../observable/empty';
import { concat as concatStatic } from '../observable/concat';
import { isScheduler } from '../util/isScheduler';
import { MonoTypeOperatorFunction, SchedulerLike } from '../types';

/* tslint:disable:max-line-length */
export function startWith<T>(v1: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
export function startWith<T>(v1: T, v2: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
export function startWith<T>(v1: T, v2: T, v3: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
export function startWith<T>(v1: T, v2: T, v3: T, v4: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
export function startWith<T>(v1: T, v2: T, v3: T, v4: T, v5: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
export function startWith<T>(v1: T, v2: T, v3: T, v4: T, v5: T, v6: T, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
export function startWith<T>(...array: Array<T | SchedulerLike>): MonoTypeOperatorFunction<T>;
/* tslint:enable:max-line-length */

/**
 * Returns an Observable that emits the items you specify as arguments before it begins to emit
 * items emitted by the source Observable.
 *
 * <span class="informal">First emits its arguments in order, and then any
 * emissions from the source.</span>
 *
 * ![](startWith.png)
 *
 * ## Examples
 *
 * Start the chain of emissions with `"first"`, `"second"`
 *
 * ```javascript
 *   of("from source")
 *    .pipe(startWith("first", "second"))
 *    .subscribe(x => console.log(x));
 *
 * // results:
 * //   "first"
 * //   "second"
 * //   "from source"
 * ```
 *
 * @param {...T} values - Items you want the modified Observable to emit first.
 * @param {SchedulerLike} [scheduler] - A {@link SchedulerLike} to use for scheduling
 * the emissions of the `next` notifications.
 * @return {Observable} An Observable that emits the items in the specified Iterable and then emits the items
 * emitted by the source Observable.
 * @method startWith
 * @owner Observable
 */
export function startWith<T>(...array: Array<T | SchedulerLike>): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => {
    let scheduler = <SchedulerLike>array[array.length - 1];
    if (isScheduler(scheduler)) {
      array.pop();
    } else {
      scheduler = null;
    }

    const len = array.length;
    if (len === 1 && !scheduler) {
      return concatStatic(scalar(array[0] as T), source);
    } else if (len > 0) {
      return concatStatic(fromArray(array as T[], scheduler), source);
    } else {
      return concatStatic<T>(empty(scheduler) as any, source);
    }
  };
}
