import Operator from '../Operator';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

export default function defaultIfEmpty<T, R>(defaultValue: R = null): Observable<T> | Observable<R> {
  return this.lift(new DefaultIfEmptyOperator(defaultValue));
}

class DefaultIfEmptyOperator<T, R> implements Operator<T, R> {

  constructor(private defaultValue: R) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new DefaultIfEmptySubscriber(subscriber, this.defaultValue);
  }
}

class DefaultIfEmptySubscriber<T, R> extends Subscriber<T> {

  isEmpty: boolean = true;

  constructor(destination: Subscriber<T>, private defaultValue: R) {
    super(destination);
  }

  _next(x) {
    this.isEmpty = false;
    this.destination.next(x);
  }

  _complete() {
    if (this.isEmpty) {
      this.destination.next(this.defaultValue);
    }
    this.destination.complete();
  }
}
