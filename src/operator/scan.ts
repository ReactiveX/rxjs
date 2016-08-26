import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';

/**
 * Applies an accumulator function over the source Observable, and returns each
 * intermediate result, with an optional seed value.
 *
 * <span class="informal">It's like {@link reduce}, but emits the current
 * accumulation whenever the source emits a value.</span>
 *
 * <img src="./img/scan.png" width="100%">
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
 * @example <caption>Count the number of click events</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var ones = clicks.mapTo(1);
 * var seed = 0;
 * var count = ones.scan((acc, one) => acc + one, seed);
 * count.subscribe(x => console.log(x));
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
 * @owner Observable
 */
export function scan<T, R>(accumulator: (acc: R, value: T, index: number) => R, seed?: T | R): Observable<R> {
  return this.lift(new ScanOperator(accumulator, seed));
}

class ScanOperator<T, R> implements Operator<T, R> {
  constructor(private accumulator: (acc: R, value: T, index: number) => R, private seed?: T | R) {
  }

  call(subscriber: Subscriber<R>, source: any): any {
    return source._subscribe(new ScanSubscriber(subscriber, this.accumulator, this.seed));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class ScanSubscriber<T, R> extends Subscriber<T> {
  private index: number = 0;
  private accumulatorSet: boolean = false;
  private _seed: T | R;

  get seed(): T | R {
    return this._seed;
  }

  set seed(value: T | R) {
    this.accumulatorSet = true;
    this._seed = value;
  }

  constructor(destination: Subscriber<R>, private accumulator: (acc: R, value: T, index: number) => R, seed?: T | R) {
    super(destination);
    this.seed = seed;
    this.accumulatorSet = typeof seed !== 'undefined';
  }

  protected _next(value: T): void {
    if (!this.accumulatorSet) {
      this.seed = value;
      this.destination.next(value);
    } else {
      return this._tryNext(value);
    }
  }

  private _tryNext(value: T): void {
    const index = this.index++;
    let result: any;
    try {
      result = this.accumulator(<R>this.seed, value, index);
    } catch (err) {
      this.destination.error(err);
    }
    this.seed = result;
    this.destination.next(result);
  }
}
