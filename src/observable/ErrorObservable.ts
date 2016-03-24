import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {TeardownLogic} from '../Subscription';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class ErrorObservable extends Observable<any> {

  /**
   * @param error
   * @param scheduler
   * @return {ErrorObservable}
   * @static true
   * @name throw
   * @owner Observable
   */
  static create<T>(error: any, scheduler?: Scheduler) {
    return new ErrorObservable(error, scheduler);
  }

  static dispatch({ error, subscriber }) {
    subscriber.error(error);
  }

  constructor(public error: any, private scheduler?: Scheduler) {
    super();
  }

  protected _subscribe(subscriber: any): TeardownLogic {
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
