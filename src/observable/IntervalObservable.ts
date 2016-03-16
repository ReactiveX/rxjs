import {Subscriber} from '../Subscriber';
import {isNumeric} from '../util/isNumeric';
import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {async} from '../scheduler/async';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class IntervalObservable extends Observable<number> {
  /**
   * @param period
   * @param scheduler
   * @return {IntervalObservable}
   * @static true
   * @name interval
   * @owner Observable
   */
  static create(period: number = 0, scheduler: Scheduler = async): Observable<number> {
    return new IntervalObservable(period, scheduler);
  }

  static dispatch(state: any): void {
    const { index, subscriber, period } = state;

    subscriber.next(index);

    if (subscriber.isUnsubscribed) {
      return;
    }

    state.index += 1;

    (<any> this).schedule(state, period);
  }

  constructor(private period: number = 0, private scheduler: Scheduler = async) {
    super();
    if (!isNumeric(period) || period < 0) {
      this.period = 0;
    }
    if (!scheduler || typeof scheduler.schedule !== 'function') {
      this.scheduler = async;
    }
  }

  protected _subscribe(subscriber: Subscriber<number>) {
    const index = 0;
    const period = this.period;
    const scheduler = this.scheduler;

    subscriber.add(scheduler.schedule(IntervalObservable.dispatch, period, {
      index, subscriber, period
    }));
  }
}
