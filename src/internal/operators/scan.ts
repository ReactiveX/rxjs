import { OperatorFunction, Operator } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';

/**
 * Applies an accumulator function over the source Observable, and returns each
 * intermediate result, with an optional seed value.
 *
 * <span class="informal">It's like {@link reduce}, but emits the current
 * accumulation whenever the source emits a value.</span>
 *
 * ![](scan.png)
 *
 * Combines together all values emitted on the source, using an accumulator
 * function that knows how to join a new source value into the accumulation from
 * the past. Is similar to {@link reduce}, but emits the intermediate
 * accumulations.
 *
 * Returns an Observable that applies a specified `accumulator` function to each
 * item emitted by the source Observable. If a `seed` value is specified, then
 * that value will be used as the initial value for the accumulator. If no seed
 * value is specified, the first item of the source is used as the seed.
 *
 * ## Example
 * Count the number of click events
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const ones = clicks.pipe(mapTo(1));
 * const seed = 0;
 * const count = ones.pipe(scan((acc, one) => acc + one, seed));
 * count.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link expand}
 * @see {@link mergeScan}
 * @see {@link reduce}
 *
 * @param {function(acc: R, value: T, index: number): R} accumulator
 * The accumulator function called on each source value.
 * @param {T|R} [seed] The initial accumulation value.
 * @return {Observable<R>} An observable of the accumulated values.
 * @method scan
 */
export function scan<T>(reducer: (state: T, value: T, index: number) => T): OperatorFunction<T, T>;
export function scan<T, R>(reducer: (state: T|R, value: T, index: number) => R): OperatorFunction<T, R>;
export function scan<T, R>(reducer: (state: R, valeu: T, index: number) => R, initialState: R): OperatorFunction<T, R>;
export function scan<T, R, I>(reducer: (state: I|R, value: T, index: number) => R, initialState: I): OperatorFunction<T, R|I>;
export function scan<T, R, I>(reducer: (state: T|R|I, value: T, index: number) => R, initialState?: I): OperatorFunction<T, T|R|I> {
  let hasState = arguments.length >= 2;
  return (source: Observable<T>) => source.lift(scanOperator(reducer, initialState, hasState));
}

function scanOperator<T, R, I>(reducer: (state: T|R|I, value: T, index: number) => R, initialState: I, hasState: boolean): Operator<T> {
  return function scanLifted(this: MutableSubscriber<any>, source: Observable<T>) {
    const mut = this;
    const _next = mut.next;
    let _state: T|R|I = initialState;
    let _index = 0;

    mut.next = (value: T) => {
      if (hasState) {
        value = tryUserFunction(reducer, [_state, value, _index++]) as any;
        if (resultIsError(value)) {
          mut.error(value.error);
          return;
        }
      }
      _state = value;
      hasState = true;
      _next(value);
    };

    return source.subscribe(this);
  };
}
