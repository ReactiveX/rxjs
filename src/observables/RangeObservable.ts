import Scheduler from '../Scheduler';
import Observable from '../Observable';

export default class RangeObservable<T> extends Observable<T> {

  static create(start: number = 0, count: number = 0, scheduler?: Scheduler) {
    return new RangeObservable(start, count, scheduler);
  }

  static dispatch(state) {

    const { start, index, count, subscriber } = state;

    if (index >= count) {
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

  constructor(private start: number, private count: number, private scheduler?: Scheduler) {
    super();
  }

  _subscribe(subscriber) {

    let index = 0;
    let start = this.start;
    const count = this.count;
    const scheduler = this.scheduler;

    if (scheduler) {
      subscriber.add(scheduler.schedule(0, {
        index, count, start, subscriber
      }, RangeObservable.dispatch));
    } else {
      do {
        if (index++ >= count) {
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
