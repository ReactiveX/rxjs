import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {EmptyObservable} from '../observable/EmptyObservable';
import {TeardownLogic} from '../Subscription';

/**
 * Returns an Observable that repeats the stream of items emitted by the source Observable at most count times,
 * on a particular Scheduler.
 *
 * <img src="./img/repeat.png" width="100%">
 *
 * @param {Scheduler} [scheduler] the Scheduler to emit the items on.
 * @param {number} [count] the number of times the source Observable items are repeated, a count of 0 will yield
 * an empty Observable.
 * @return {Observable} an Observable that repeats the stream of items emitted by the source Observable at most
 * count times.
 * @method repeat
 * @owner Observable
 */
export function repeat<T>(count: number = -1): Observable<T> {
  if (count === 0) {
    return new EmptyObservable<T>();
  } else if (count < 0) {
    return this.lift(new RepeatOperator(-1, this));
  } else {
    return this.lift(new RepeatOperator(count - 1, this));
  }
}

export interface RepeatSignature<T> {
  (count?: number): Observable<T>;
}

class RepeatOperator<T> implements Operator<T, T> {
  constructor(private count: number,
              private source: Observable<T>) {
  }
  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source._subscribe(new RepeatSubscriber(subscriber, this.count, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
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
      this.closed = false;
      source.subscribe(this);
    }
  }
}
