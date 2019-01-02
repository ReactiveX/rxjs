import { OperatorFunction } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { Subscriber } from '../Subscriber';
import { OperatorSubscriber } from '../OperatorSubscriber';

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
export function scan<T, R, I>(reducer: (state: T|R|I, value: T, index: number) => R, initialState?: R|I): OperatorFunction<T, T|R|I> {
  let hasState = arguments.length >= 2;
  return (source: Observable<T>) => new Observable(subscriber =>
    source.subscribe(new ScanSubscriber<T, R, I>(subscriber, reducer, initialState, hasState)));
}

class ScanSubscriber<T, R, I> extends OperatorSubscriber<T> {
  private _index = 0;
  private _state: T|R|I;

  constructor(
    destination: Subscriber<T|R|I>,
    private _reducer: (state: T|R|I, value: T, index: number) => R,
    _initialState: R|I,
    private _hasState: boolean
  ) {
    super(destination);
    if (_hasState) {
      this._state = _initialState;
    }
  }

  _next(value: T) {
    const { _destination } = this;
    const index = this._index++;
    if (this._hasState) {
      value = tryUserFunction(this._reducer, [this._state, value, index]) as any;
      if (resultIsError(value)) {
        _destination.error(value.error);
        return;
      }
    }
    this._state = value;
    this._hasState = true;
    _destination.next(value);
  }
}
