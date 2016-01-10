import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Notification} from '../Notification';

/**
 * Returns an Observable that represents all of the emissions and notifications
 * from the source Observable into emissions marked with their original types
 * within a `Notification` objects.
 *
 * <img src="./img/materialize.png" width="100%">
 *
 * @scheduler materialize does not operate by default on a particular Scheduler.
 * @returns {Observable} an Observable that emits items that are the result of
 * materializing the items and notifications of the source Observable.
 */
export function materialize<T>(): Observable<Notification<T>> {
  return this.lift(new MaterializeOperator());
}

class MaterializeOperator<T, R> implements Operator<T, R> {
  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new MaterializeSubscriber(subscriber);
  }
}

class MaterializeSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<T>) {
    super(destination);
  }

  _next(value: T) {
    this.destination.next(Notification.createNext(value));
  }

  _error(err: any) {
    const destination = this.destination;
    destination.next(Notification.createError(err));
    destination.complete();
  }

  _complete() {
    const destination = this.destination;
    destination.next(Notification.createComplete());
    destination.complete();
  }
}
