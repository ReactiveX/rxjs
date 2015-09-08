import Scheduler from '../Scheduler';
import Observable from '../Observable';

export default class ScalarObservable<T> extends Observable<T> {

  static create<T>(value: T, scheduler?: Scheduler) {
    return new ScalarObservable(value, scheduler);
  }

  static dispatch(state) {

    const { done, value, subscriber } = state;

    if (done) {
      subscriber.complete();
      return;
    }

    subscriber.next(value);

    if (subscriber.isUnsubscribed) {
      return;
    }

    state.done = true;

    (<any> this).schedule(state);
  }

  _isScalar: boolean = true;
  
  constructor(public value: T, private scheduler?: Scheduler) {
    super();
  }

  _subscribe(subscriber) {

    const value = this.value;
    const scheduler = this.scheduler;

    if (scheduler) {
      subscriber.add(scheduler.schedule(ScalarObservable.dispatch, 0, {
        done: false, value, subscriber
      }));
    } else {
      subscriber.next(value);
      if (!subscriber.isUnsubscribed) {
        subscriber.complete();
      }
    }
  }
}
