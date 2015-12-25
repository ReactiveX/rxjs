import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {Subscription} from '../Subscription';

export class ErrorObservable<T> extends Observable<T> {

  static create<T>(error: T, scheduler?: Scheduler) {
    return new ErrorObservable(error, scheduler);
  }

  static dispatch({ error, subscriber }) {
    subscriber.error(error);
  }

  constructor(public error: T, private scheduler?: Scheduler) {
    super();
  }

  _subscribe(subscriber): Subscription | Function | void {

    const error = this.error;
    const scheduler = this.scheduler;

    if (scheduler) {
      return scheduler.schedule(ErrorObservable.dispatch, 0, {
        error, subscriber
      });
    } else {
      subscriber.error(error);
    }
  }
}
