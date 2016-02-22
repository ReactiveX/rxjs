import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';

/**
 * Returns an Observable that searches for the first item in the source Observable that
 * matches the specified condition, and returns the first occurrence in the source.
 * @param {function} predicate function called with each item to test for condition matching.
 * @return {Observable} an Observable of the first item that matches the condition.
 * @method find
 * @owner Observable
 */
export function find<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<T> {
  if (typeof predicate !== 'function') {
    throw new TypeError('predicate is not a function');
  }
  return this.lift(new FindValueOperator(predicate, this, false, thisArg));
}

export interface FindSignature<T> {
  (predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<T>;
}

export class FindValueOperator<T> implements Operator<T, T> {
  constructor(private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private source: Observable<T>,
              private yieldIndex: boolean,
              private thisArg?: any) {
  }

  call(observer: Subscriber<T>): Subscriber<T> {
    return new FindValueSubscriber(observer, this.predicate, this.source, this.yieldIndex, this.thisArg);
  }
}

export class FindValueSubscriber<T> extends Subscriber<T> {
  private index: number = 0;

  constructor(destination: Subscriber<T>,
              private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private source: Observable<T>,
              private yieldIndex: boolean,
              private thisArg?: any) {
    super(destination);
  }

  private notifyComplete(value: any): void {
    const destination = this.destination;

    destination.next(value);
    destination.complete();
  }

  protected _next(value: T): void {
    const { predicate, thisArg } = this;
    const index = this.index++;
    try {
      const result = predicate.call(thisArg || this, value, index, this.source);
      if (result) {
        this.notifyComplete(this.yieldIndex ? index : value);
      }
    } catch (err) {
      this.destination.error(err);
    }
  }

  protected _complete(): void {
    this.notifyComplete(this.yieldIndex ? -1 : undefined);
  }
}