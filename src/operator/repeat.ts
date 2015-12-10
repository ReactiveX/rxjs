import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {EmptyObservable} from '../observable/empty';

export function repeat<T>(count: number = -1): Observable<T> {
  if (count === 0) {
    return new EmptyObservable<T>();
  } else if (count < 0) {
    return this.lift(new RepeatOperator(-1, this));
  } else {
    return this.lift(new RepeatOperator(count - 1, this));
  }
}

class RepeatOperator<T> implements Operator<T, T> {
  constructor(private count: number,
              private source: Observable<T>) {
  }
  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new RepeatSubscriber(subscriber, this.count, this.source);
  }
}

class RepeatSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<any>,
              private count: number,
              private source: Observable<T>) {
    super(destination);
  }
  complete() {
    if (!this.isStopped) {
      const { source, count } = this;
      if (count === 0) {
        return super.complete();
      } else if (count > -1) {
        this.count = count - 1;
      }
      this.unsubscribe();
      this.isStopped = false;
      this.isUnsubscribed = false;
      source.subscribe(this);
    }
  }
}
