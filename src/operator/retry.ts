import {Operator} from '../Operator';
import {ISubscriber, Subscriber} from '../Subscriber';
import {IObservable} from '../Observable';
import {TeardownLogic} from '../Subscription';

/**
 * Returns an Observable that mirrors the source Observable, resubscribing to it if it calls `error` and the
 * predicate returns true for that specific exception and retry count.
 * If the source Observable calls `error`, this method will resubscribe to the source Observable for a maximum of
 * count resubscriptions (given as a number parameter) rather than propagating the `error` call.
 *
 * <img src="./img/retry.png" width="100%">
 *
 * Any and all items emitted by the source Observable will be emitted by the resulting Observable, even those emitted
 * during failed subscriptions. For example, if an Observable fails at first but emits [1, 2] then succeeds the second
 * time and emits: [1, 2, 3, 4, 5] then the complete stream of emissions and notifications
 * would be: [1, 2, 1, 2, 3, 4, 5, `complete`].
 * @param {number} number of retry attempts before failing.
 * @return {Observable} the source Observable modified with the retry logic.
 * @method retry
 * @owner Observable
 */
export function retry<T>(count: number = -1): IObservable<T> {
  return this.lift(new RetryOperator(count, this));
}

export interface RetrySignature<T> {
  (count?: number): IObservable<T>;
}

class RetryOperator<T> implements Operator<T, T> {
  constructor(private count: number,
              private source: IObservable<T>) {
  }

  call(subscriber: ISubscriber<T>, source: any): TeardownLogic {
    return source._subscribe(new RetrySubscriber(subscriber, this.count, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class RetrySubscriber<T> extends Subscriber<T> {
  constructor(destination: ISubscriber<any>,
              private count: number,
              private source: IObservable<T>) {
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
      this.closed = false;
      source.subscribe(this);
    }
  }
}
