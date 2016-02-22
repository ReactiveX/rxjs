import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {ArgumentOutOfRangeError} from '../util/ArgumentOutOfRangeError';
import {EmptyObservable} from '../observable/EmptyObservable';
import {Observable} from '../Observable';

/**
 * @param total
 * @return {any}
 * @method take
 * @owner Observable
 */
export function take<T>(total: number): Observable<T> {
  if (total === 0) {
    return new EmptyObservable<T>();
  } else {
    return this.lift(new TakeOperator(total));
  }
}

export interface TakeSignature<T> {
  (total: number): Observable<T>;
}

class TakeOperator<T> implements Operator<T, T> {
  constructor(private total: number) {
    if (this.total < 0) {
      throw new ArgumentOutOfRangeError;
    }
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new TakeSubscriber(subscriber, this.total);
  }
}

class TakeSubscriber<T> extends Subscriber<T> {
  private count: number = 0;

  constructor(destination: Subscriber<T>, private total: number) {
    super(destination);
  }

  protected _next(value: T): void {
    const total = this.total;
    if (++this.count <= total) {
      this.destination.next(value);
      if (this.count === total) {
        this.destination.complete();
      }
    }
  }
}
