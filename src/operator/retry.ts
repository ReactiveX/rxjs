import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';

/**
 * Returns an Observable that mirrors the source Observable, resubscribing to it if it calls onError and the
 * predicate returns true for that specific exception and retry count.
 * If the source Observable calls `onError`, this method will resubscribe to the source Observable for a maximum of
 * count resubscriptions (given as a number parameter) rather than propagating the `onError` call.
 *
 * <img src="./img/retry.png" width="100%">
 *
 * Any and all items emitted by the source Observable will be emitted by the resulting Observable, even those emitted
 * during failed subscriptions. For example, if an Observable fails at first but emits [1, 2] then succeeds the second
 * time and emits: [1, 2, 3, 4, 5] then the complete stream of emissions and notifications
 * would be: [1, 2, 1, 2, 3, 4, 5, onCompleted].
 * @param {number} number of retry attempts before failing.
 * @returns {Observable} the source Observable modified with the retry logic.
 */
export function retry<T>(count: number = -1): Observable<T> {
  return this.lift(new RetryOperator(count, this));
}

class RetryOperator<T> implements Operator<T, T> {
  constructor(private count: number,
              private source: Observable<T>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new RetrySubscriber(subscriber, this.count, this.source);
  }
}

class RetrySubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<any>,
              private count: number,
              private source: Observable<T>) {
    super(destination);
  }
  error(err: any) {
    if (!this.isStopped) {
      const { source, count } = this;
      if (count === 0) {
        return super.error(err);
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
