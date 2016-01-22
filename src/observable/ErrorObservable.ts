import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {Subscription} from '../Subscription';

export class ErrorObservable extends Observable<any> {

  static create<T>(error: any, scheduler?: Scheduler) {
    return new ErrorObservable(error, scheduler);
  }

  static dispatch({ error, subscriber }) {
    subscriber.error(error);
  }

  constructor(public error: any, private scheduler?: Scheduler) {
    super();
  }

  protected _subscribe(subscriber: any): Subscription | Function | void {
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
