import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';

/**
 * Returns an Observable that applies a select function to each item.  The result of the select function is used as a
 * key into the strategy object to find an accumulator function.  The accumulator is applied to each item emitted by the source Observable.
 *
 * @param {function} select The select function which gets called on each item and returns the key to an accumulator function in the strategy.
 * @param {object} strategy An object with a key value pair for each possible return value of select.
 * The values are accumulator functions which are applided to each item.
 *
 * @param {any} [seed] The initial accumulator value.
 * @returns {Observable} An observable of the accumulated values.
 */
export function scanCase<T, R>(
  selector: (value: T, index: number) => string | number | symbol,
  strategy: {
      key: string | number | symbol,
      acc: (acc: R, value: T) => R
  },
  seed?: T | R): Observable<R> {
  return this.lift(new ScanCaseOperator(selector, strategy, seed));
}

class ScanCaseOperator<T, R> implements Operator<T, R> {
  constructor(
    private select: (value: T, index: number) => string | number | symbol,
    private strategy: { key: string | number | symbol, acc: (acc: R, value: T) => R },
    private seed?: T | R) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new ScanCaseSubscriber(subscriber, this.select, this.strategy, this.seed);
  }
}

class ScanCaseSubscriber<T, R> extends Subscriber<T> {
  private _seed: T | R;
  private _select: (value: T, index: number) => string | number | symbol;
  private _strategy: { key: string | number | symbol, acc: (acc: R, value: T) => R };
  private accumulatorSet: boolean = false;

  count: number = 0;

  get seed(): T | R {
    return this._seed;
  }

  set seed(value: T | R) {
    this.accumulatorSet = true;
    this._seed = value;
  }

  get select(): (value: T, index: number) => string | number | symbol {
    return this._select;
  }

  set select(value: (value: T, index: number) => string | number | symbol) {
    this._select = value;
  }

  get strategy(): { key: string | number | symbol, acc: (acc: R, value: T) => R } {
    return this._strategy;
  }

  set strategy(value: { key: string | number | symbol, acc: (acc: R, value: T) => R }) {
    this._strategy = value;
  }

  constructor(
    destination: Subscriber<T>,
    select: (value: T, index: number) => string | number | symbol,
    strategy: { key: string | number | symbol, acc: (acc: R, value: T) => R },
    seed?: T | R) {
      super(destination);
      this.seed = seed;
      this.select = select;
      this.strategy = strategy;
      this.accumulatorSet = typeof seed !== 'undefined';
  }

  protected _next(value: T): void {
    if (!this.accumulatorSet) {
      this.seed = value;
      this.destination.next(value);
    } else {
      let accumulator: (acc: R, value: T) => R;
      try {
        const key = this.select(value, this.count);
        accumulator = this.strategy[key];
        this.count++;
      } catch (err) {
        return this.destination.error(err);
      }
      return this._tryNext(value, accumulator);
    }
  }

  protected _tryNext(value: T, accumulator: (acc: R, value: T) => R): void {
    let result: R;
    try {
      if (accumulator) {
        result = accumulator(<R>this.seed, value);
      } else {
        result = <R>this.seed;
      }
    } catch (err) {
      this.destination.error(err);
    }
    this.seed = result;
    this.destination.next(result);
  }
}