import {Scheduler} from '../Scheduler';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {TeardownLogic} from '../Subscription';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class EmptyObservable<T> extends Observable<T> {

  /**
   * @param scheduler
   * @return {Observable<T>}
   * @static true
   * @name empty
   * @owner Observable
   */
  static create<T>(scheduler?: Scheduler): Observable<T> {
    return new EmptyObservable<T>(scheduler);
  }

  static dispatch({ subscriber }) {
    subscriber.complete();
  }

  constructor(private scheduler?: Scheduler) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>): TeardownLogic {

    const scheduler = this.scheduler;

    if (scheduler) {
      return scheduler.schedule(EmptyObservable.dispatch, 0, { subscriber });
    } else {
      subscriber.complete();
    }
  }
}
