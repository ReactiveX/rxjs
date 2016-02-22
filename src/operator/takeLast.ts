import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {ArgumentOutOfRangeError} from '../util/ArgumentOutOfRangeError';
import {EmptyObservable} from '../observable/EmptyObservable';
import {Observable} from '../Observable';

/**
 * @param total
 * @return {any}
 * @method takeLast
 * @owner Observable
 */
export function takeLast<T>(total: number): Observable<T> {
  if (total === 0) {
    return new EmptyObservable<T>();
  } else {
    return this.lift(new TakeLastOperator(total));
  }
}

export interface TakeLastSignature<T> {
  (total: number): Observable<T>;
}

class TakeLastOperator<T> implements Operator<T, T> {
  constructor(private total: number) {
    if (this.total < 0) {
      throw new ArgumentOutOfRangeError;
    }
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new TakeLastSubscriber(subscriber, this.total);
  }
}

class TakeLastSubscriber<T> extends Subscriber<T> {
  private ring: T[];
  private count: number = 0;
  private index: number = 0;

  constructor(destination: Subscriber<T>, private total: number) {
    super(destination);
    this.ring = new Array(total);
  }

  protected _next(value: T): void {

    let index = this.index;
    const ring = this.ring;
    const total = this.total;
    const count = this.count;

    if (total > 1) {
      if (count < total) {
        this.count = count + 1;
        this.index = index + 1;
      } else if (index === 0) {
        this.index = ++index;
      } else if (index < total) {
        this.index = index + 1;
      } else  {
        this.index = index = 0;
      }
    } else if (count < total) {
      this.count = total;
    }

    ring[index] = value;
  }

  protected _complete(): void {

    let iter = -1;
    const { ring, count, total, destination } = this;
    let index = (total === 1 || count < total) ? 0 : this.index - 1;

    while (++iter < count) {
      if (iter + index === total) {
        index = total - iter;
      }
      destination.next(ring[iter + index]);
    }
    destination.complete();
  }
}
