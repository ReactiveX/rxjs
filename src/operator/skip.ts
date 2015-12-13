import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';

export function skip<T>(total: number): Observable<T> {
  return this.lift(new SkipOperator(total));
}

class SkipOperator<T> implements Operator<T, T> {
  constructor(private total: number) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new SkipSubscriber(subscriber, this.total);
  }
}

class SkipSubscriber<T> extends Subscriber<T> {
  count: number = 0;

  constructor(destination: Subscriber<T>, private total: number) {
    super(destination);
  }

  _next(x: T) {
    if (++this.count > this.total) {
      this.destination.next(x);
    }
  }
}
