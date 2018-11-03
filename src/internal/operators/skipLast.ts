import { OperatorFunction, Sink, FOType, SinkArg } from "rxjs/internal/types";
import { lift } from "rxjs/internal/util/lift";
import { Observable } from "rxjs/internal/Observable";
import { Subscription } from "rxjs/internal/Subscription";
import { ArgumentOutOfRangeError } from "rxjs/internal/util/ArgumentOutOfRangeError";

/**
 * Skip the last `count` values emitted by the source Observable.
 *
 * ![](skipLast.png)
 *
 * `skipLast` returns an Observable that accumulates a queue with a length
 * enough to store the first `count` values. As more values are received,
 * values are taken from the front of the queue and produced on the result
 * sequence. This causes values to be delayed.
 *
 * ## Example
 * Skip the last 2 values of an Observable with many values
 * ```javascript
 * const many = range(1, 5);
 * const skipLastTwo = many.pipe(skipLast(2));
 * skipLastTwo.subscribe(x => console.log(x));
 *
 * // Results in:
 * // 1 2 3
 * ```
 *
 * @see {@link skip}
 * @see {@link skipUntil}
 * @see {@link skipWhile}
 * @see {@link take}
 *
 * @throws {ArgumentOutOfRangeError} When using `skipLast(i)`, it throws
 * ArgumentOutOrRangeError if `i < 0`.
 *
 * @param {number} count Number of elements to skip from the end of the source Observable.
 * @returns {Observable<T>} An Observable that skips the last count values
 * emitted by the source Observable.
 * @method skipLast
 * @owner Observable
 */
export function skipLast<T>(count: number): OperatorFunction<T, T> {
  if (count < 0) {
    throw new ArgumentOutOfRangeError();
  }
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    const buffer: T[] = [];
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        buffer.push(v);
        const emit = buffer.splice(0, buffer.length - count);
        for (let i = 0; i < emit.length && !subs.closed; i++) {
          dest(FOType.NEXT, emit[i], subs);
        }
      } else {
        dest(t, v, subs);
      }
    }, subs);
  });
}
