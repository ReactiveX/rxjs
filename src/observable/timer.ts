import {isNumeric} from '../util/isNumeric';
import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {asap} from '../scheduler/asap';
import {isScheduler} from '../util/isScheduler';
import {isDate} from '../util/isDate';

export class TimerObservable<T> extends Observable<T> {

  static create(dueTime: number | Date = 0, period?: number | Scheduler, scheduler?: Scheduler): Observable<number> {
    return new TimerObservable(dueTime, period, scheduler);
  }

  static dispatch(state) {

    const { index, period, subscriber } = state;
    const action = (<any> this);

    subscriber.next(index);

    if (typeof period === 'undefined') {
      subscriber.complete();
      return;
    } else if (subscriber.isUnsubscribed) {
      return;
    }

    if (typeof action.delay === 'undefined') {
      action.add(action.scheduler.schedule(TimerObservable.dispatch, period, {
        index: index + 1, period, subscriber
      }));
    } else {
      state.index = index + 1;
      action.schedule(state, period);
    }
  }

  _period: number;
  private dueTime: number = 0;

  constructor(dueTime: number | Date = 0,
              private period?: number | Scheduler,
              private scheduler?: Scheduler) {
    super();

    if (isNumeric(period)) {
      this._period = Number(period) < 1 && 1 || Number(period);
    } else if (isScheduler(period)) {
      scheduler = <Scheduler> period;
    }
    if (!isScheduler(scheduler)) {
      scheduler = asap;
    }
    this.scheduler = scheduler;

    const absoluteDueTime = isDate(dueTime);
    this.dueTime = absoluteDueTime ? (+dueTime - this.scheduler.now()) : <number>dueTime;
  }

  _subscribe(subscriber) {

    const index = 0;
    const period = this._period;
    const dueTime = this.dueTime;
    const scheduler = this.scheduler;

    subscriber.add(scheduler.schedule(TimerObservable.dispatch, dueTime, { index, period, subscriber }));
  }
}
