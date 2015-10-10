import Scheduler from '../Scheduler';
import Observable from '../Observable';

export default class EmptyObservable<T> extends Observable<T> {

  static create<T>(scheduler?: Scheduler): Observable<T> {
    return new EmptyObservable(scheduler);
  }

  static dispatch({ subscriber }) {
    subscriber.complete();
  }

  constructor(private scheduler?: Scheduler) {
    super();
  }

  _subscribe(subscriber) {

    const scheduler = this.scheduler;

    if (scheduler) {
      subscriber.add(scheduler.schedule(EmptyObservable.dispatch, 0, { subscriber }));
    } else {
      subscriber.complete();
    }
  }
}
