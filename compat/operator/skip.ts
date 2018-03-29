import { Observable } from 'rxjs';
import { skip as higherOrder } from 'rxjs/operators';

/**
 * Returns an Observable that skips the first `count` items emitted by the source Observable.
 *
 * <img src="./img/skip.png" width="100%">
 *
 * @param {Number} count - The number of times, items emitted by source Observable should be skipped.
 * @return {Observable} An Observable that skips values emitted by the source Observable.
 *
 * @method skip
 * @owner Observable
 */
export function skip<T>(this: Observable<T>, count: number): Observable<T> {
  return higherOrder(count)(this) as Observable<T>;
}
