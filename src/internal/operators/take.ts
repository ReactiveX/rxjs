import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { ArgumentOutOfRangeError } from '../util/ArgumentOutOfRangeError';
import { Observable } from '../Observable';
import { MonoTypeOperatorFunction, TeardownLogic } from '../types';
import { EMPTY } from '../observable/empty';
import { lift } from '../util/lift';

/**
 * Emits only the first `count` values emitted by the source Observable.
 *
 * <span class="informal">Takes the first `count` values from the source, then
 * completes.</span>
 *
 * ![](take.png)
 *
 * `take` returns an Observable that emits only the first `count` values emitted
 * by the source Observable. If the source emits fewer than `count` values then
 * all of its values are emitted. After that, it completes, regardless if the
 * source completes.
 *
 * ## Example
 * Take the first 5 seconds of an infinite 1-second interval Observable
 * ```ts
 * import { interval } from 'rxjs';
 * import { take } from 'rxjs/operators';
 *
 * const intervalCount = interval(1000);
 * const takeFive = intervalCount.pipe(take(5));
 * takeFive.subscribe(x => console.log(x));
 *
 * // Logs:
 * // 0
 * // 1
 * // 2
 * // 3
 * // 4
 * ```
 *
 * @see {@link takeLast}
 * @see {@link takeUntil}
 * @see {@link takeWhile}
 * @see {@link skip}
 *
 * @throws {ArgumentOutOfRangeError} When using `take(i)`, it delivers an
 * ArgumentOutOrRangeError to the Observer's `error` callback if `i < 0`.
 * @throws {TypeError} when no numeric argument is passed.
 * @param count The maximum number of `next` values to emit.
 * @return An Observable that emits only the first `count`
 * values emitted by the source Observable, or all of the values from the source
 * if the source emits fewer than `count` values.
 */
export function take<T>(count: number): MonoTypeOperatorFunction<T> {
  if (isNaN(count)) {
    throw new TypeError(`'count' is not a number`);
  }
  if (count < 0) {
    throw new ArgumentOutOfRangeError;
  }

  return (source: Observable<T>) => (count === 0) ? EMPTY : lift(source, new TakeOperator(count));
}

class TakeOperator<T> implements Operator<T, T> {
  constructor(private count: number) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new TakeSubscriber(subscriber, this.count));
  }
}

class TakeSubscriber<T> extends Subscriber<T> {
  private _valueCount: number = 0;

  constructor(destination: Subscriber<T>, private count: number) {
    super(destination);
  }

  protected _next(value: T): void {
    const total = this.count;
    const count = ++this._valueCount;
    if (count <= total) {
      this.destination.next(value);
      if (count === total) {
        this.destination.complete();
        this.unsubscribe();
      }
    }
  }
}
