import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {TeardownLogic} from '../Subscription';
import {Subscriber} from '../Subscriber';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class RangeObservable extends Observable<number> {

  /**
   * @param start
   * @param end
   * @param scheduler
   * @return {RangeObservable}
   * @static true
   * @name range
   * @owner Observable
   */
  static create(start: number = 0, end: number = 0, scheduler?: Scheduler): Observable<number> {
    return new RangeObservable(start, end, scheduler);
  }

  static dispatch(state: any) {

    const { start, index, end, subscriber } = state;

    if (index >= end) {
      subscriber.complete();
      return;
    }

    subscriber.next(start);

    if (subscriber.isUnsubscribed) {
      return;
    }

    state.index = index + 1;
    state.start = start + 1;

    (<any> this).schedule(state);
  }

  private start: number;
  private end: number;
  private scheduler: Scheduler;

  constructor(start: number, end: number, scheduler?: Scheduler) {
    super();
    this.start = start;
    this.end = end;
    this.scheduler = scheduler;
  }

  protected _subscribe(subscriber: Subscriber<number>): TeardownLogic {
    let index = 0;
    let start = this.start;
    const end = this.end;
    const scheduler = this.scheduler;

    if (scheduler) {
      return scheduler.schedule(RangeObservable.dispatch, 0, {
        index, end, start, subscriber
      });
    } else {
      do {
        if (index++ >= end) {
          subscriber.complete();
          break;
        }
        subscriber.next(start++);
        if (subscriber.isUnsubscribed) {
          break;
        }
      } while (true);
    }
  }
}
