import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';
import {Subscription} from '../Subscription';

export class EmptyObservable<T> extends Observable<T> {

  static create<T>(scheduler?: Scheduler): Observable<T> {
    return new EmptyObservable(scheduler);
  }

  static dispatch({ subscriber }) {
    subscriber.complete();
  }

  constructor(private scheduler?: Scheduler) {
    super();
  }

  _subscribe(subscriber): Subscription | Function | void {

    const scheduler = this.scheduler;

    if (scheduler) {
      return scheduler.schedule(EmptyObservable.dispatch, 0, { subscriber });
    } else {
      subscriber.complete();
    }
  }
}
