import { Observable, SchedulerLike } from 'rxjs';
import { startWith as higherOrder } from 'rxjs/operators';

/* tslint:disable:max-line-length */
export function startWith<T>(this: Observable<T>, scheduler?: SchedulerLike): Observable<T>;
export function startWith<T, D = T>(this: Observable<T>, v1: D, scheduler?: SchedulerLike): Observable<T | D>;
export function startWith<T, D = T, E = T>(this: Observable<T>, v1: D, v2: E, scheduler?: SchedulerLike): Observable<T | D | E>;
export function startWith<T, D = T, E = T, F = T>(this: Observable<T>, v1: D, v2: E, v3: F, scheduler?: SchedulerLike): Observable<T | D | E | F>;
export function startWith<T, D = T, E = T, F = T, G = T>(this: Observable<T>, v1: D, v2:  E, v3: F, v4: G, scheduler?: SchedulerLike): Observable<T | D | E | F | G>;
export function startWith<T, D = T, E = T, F = T, G = T, H = T>(this: Observable<T>, v1: D, v2: E, v3: F, v4: G, v5: H, scheduler?: SchedulerLike): Observable<T | D | E | F | G | H>;
export function startWith<T, D = T, E = T, F = T, G = T, H = T, I = T>(this: Observable<T>, v1: D, v2: E, v3: F, v4: G, v5: H, v6: I, scheduler?: SchedulerLike): Observable<T | D | E | F | G | H | I>;
export function startWith<T, D = T>(this: Observable<T>, ...array: Array<D | SchedulerLike>): Observable<T | D>;
/* tslint:enable:max-line-length */

/**
 * Returns an Observable that emits the items you specify as arguments before it begins to emit
 * items emitted by the source Observable.
 *
 * <img src="./img/startWith.png" width="100%">
 *
 * @param {...T} values - Items you want the modified Observable to emit first.
 * @param {Scheduler} [scheduler] - A {@link IScheduler} to use for scheduling
 * the emissions of the `next` notifications.
 * @return {Observable} An Observable that emits the items in the specified Iterable and then emits the items
 * emitted by the source Observable.
 * @method startWith
 * @owner Observable
 */
export function startWith<T, D>(this: Observable<T>, ...array: Array<D | SchedulerLike>): Observable<T |D> {
  return higherOrder<T, D>(...array)(this);
}
