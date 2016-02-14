import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';

export function toArray<T>(): Observable<T[]> {
  return this.lift(new ToArrayOperator());
}

export interface ToArraySignature<T> {
  (): Observable<T[]>;
}

class ToArrayOperator<T> implements Operator<T, T[]> {
  call(subscriber: Subscriber<T[]>): Subscriber<T> {
    return new ToArraySubscriber(subscriber);
  }
}

class ToArraySubscriber<T> extends Subscriber<T> {

  private array: T[] = [];

  constructor(destination: Subscriber<T[]>) {
    super(destination);
  }

  protected _next(x: T) {
    this.array.push(x);
  }

  protected _complete() {
    this.destination.next(this.array);
    this.destination.complete();
  }
}
