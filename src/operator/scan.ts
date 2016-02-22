import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';

/**
 * Returns an Observable that applies a specified accumulator function to each item emitted by the source Observable.
 * If a seed value is specified, then that value will be used as the initial value for the accumulator.
 * If no seed value is specified, the first item of the source is used as the seed.
 * @param {function} accumulator The accumulator function called on each item.
 *
 * <img src="./img/scan.png" width="100%">
 *
 * @param {any} [seed] The initial accumulator value.
 * @return {Obervable} An observable of the accumulated values.
 * @method scan
 * @owner Observable
 */
export function scan<T, R>(accumulator: (acc: R, value: T) => R, seed?: T | R): Observable<R> {
  return this.lift(new ScanOperator(accumulator, seed));
}

export interface ScanSignature<T> {
  <R>(accumulator: (acc: R, value: T) => R, seed?: T | R): Observable<R>;
}

class ScanOperator<T, R> implements Operator<T, R> {
  constructor(private accumulator: (acc: R, value: T) => R, private seed?: T | R) {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new ScanSubscriber(subscriber, this.accumulator, this.seed);
  }
}

class ScanSubscriber<T, R> extends Subscriber<T> {
  private _seed: T | R;

  get seed(): T | R {
    return this._seed;
  }

  set seed(value: T | R) {
    this.accumulatorSet = true;
    this._seed = value;
  }

  private accumulatorSet: boolean = false;

  constructor(destination: Subscriber<R>, private accumulator: (acc: R, value: T) => R, seed?: T|R) {
    super(destination);
    this.seed = seed;
    this.accumulator = accumulator;
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
    let result: any;
    try {
      result = this.accumulator(<R>this.seed, value);
    } catch (err) {
      this.destination.error(err);
    }
    this.seed = result;
    this.destination.next(result);
  }
}
