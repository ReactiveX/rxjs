import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';

/**
 * Returns an Observable that skips `n` items emitted by an Observable.
 *
 * <img src="./img/skip.png" width="100%">
 *
 * @param {Number} the `n` of times, items emitted by source Observable should be skipped.
 * @returns {Observable} an Observable that skips values emitted by the source Observable.
 .
 */
export function skip(total) {
  return this.lift(new SkipOperator(total));
}

class SkipOperator<T, R> implements Operator<T, R> {
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

  _next(x) {
    if (++this.count > this.total) {
      this.destination.next(x);
    }
  }
}
