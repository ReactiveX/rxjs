import { Observable } from 'rxjs/internal/Observable';
import { sourceAsObservable } from 'rxjs/internal/util/sourceAsObservable';
import { FOType, Sink } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';

/**
 * Creates an Observable that emits a sequence of numbers within a specified
 * range.
 *
 * <span class="informal">Emits a sequence of numbers in a range.</span>
 *
 * ![](range.png)
 *
 * `range` operator emits a range of sequential integers, in order, where you
 * select the `start` of the range and its `length`. By default, uses no
 * {@link SchedulerLike} and just delivers the notifications synchronously, but may use
 * an optional {@link SchedulerLike} to regulate those deliveries.
 *
 * ## Example
 * Emits the numbers 1 to 10</caption>
 * ```javascript
 * const numbers = range(1, 10);
 * numbers.subscribe(x => console.log(x));
 * ```
 * @see {@link timer}
 * @see {@link index/interval}
 *
 * @param {number} [start=0] The value of the first integer in the sequence.
 * @param {number} [count=0] The number of sequential integers to generate.
 * @return {Observable} An Observable of numbers that emits a finite range of
 * sequential integers.
 * @static true
 * @name range
 * @owner Observable
 */
export function range(start = 0, count = 0): Observable<number> {
  return sourceAsObservable((type: FOType.SUBSCRIBE, sink: Sink<number>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      const end = start + count;
      for (let n = start; n < end && !subs.closed; n++) {
        sink(FOType.NEXT, n, subs);
      }
      sink(FOType.COMPLETE, undefined, subs);
    }
  });
}
