import {Scheduler} from '../Scheduler';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {Subscription} from '../Subscription';

/**
 *
 */
export class EmptyObservable<T> extends Observable<T> {
  ' tag_class_EmptyObservable': T;

  /**
   * @param scheduler
   * @return {EmptyObservable<T>}
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

  protected _subscribe(subscriber: Subscriber<T>): Subscription | Function | void {

    const scheduler = this.scheduler;

    if (scheduler) {
      return scheduler.schedule(EmptyObservable.dispatch, 0, { subscriber });
    } else {
      subscriber.complete();
    }
  }
}
