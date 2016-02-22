import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Observer} from '../Observer';
import {Subscriber} from '../Subscriber';

/**
 * Returns an observable of a single number that represents the number of items that either:
 * Match a provided predicate function, _or_ if a predicate is not provided, the number
 * represents the total count of all items in the source observable. The count is emitted
 * by the returned observable when the source observable completes.
 * @param {function} [predicate] a boolean function to select what values are to be counted.
 * it is provided with arguments of:
 *   - `value`: the value from the source observable
 *   - `index`: the "index" of the value from the source observable
 *   - `source`: the source observable instance itself.
 * @return {Observable} an observable of one number that represents the count as described
 * above
 * @method count
 * @owner Observable
 */
export function count<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean): Observable<number> {
  return this.lift(new CountOperator(predicate, this));
}

export interface CountSignature<T> {
  (predicate?: (value: T, index: number, source: Observable<T>) => boolean): Observable<number>;
}

class CountOperator<T> implements Operator<T, number> {
  constructor(private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private source?: Observable<T>) {
  }

  call(subscriber: Subscriber<number>): Subscriber<T> {
    return new CountSubscriber(subscriber, this.predicate, this.source);
  }
}

class CountSubscriber<T> extends Subscriber<T> {
  private count: number = 0;
  private index: number = 0;

  constructor(destination: Observer<number>,
              private predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              private source?: Observable<T>) {
    super(destination);
  }

  protected _next(value: T): void {
    if (this.predicate) {
      this._tryPredicate(value);
    } else {
      this.count++;
    }
  }

  private _tryPredicate(value: T) {
    let result: any;

    try {
      result = this.predicate(value, this.index++, this.source);
    } catch (err) {
      this.destination.error(err);
      return;
    }

    if (result) {
      this.count++;
    }
  }

  protected _complete(): void {
    this.destination.next(this.count);
    this.destination.complete();
  }
}
