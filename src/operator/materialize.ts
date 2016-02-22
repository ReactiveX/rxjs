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
 * @return {Observable} an Observable that emits items that are the result of
 * materializing the items and notifications of the source Observable.
 * @method materialize
 * @owner Observable
 */
export function materialize<T>(): Observable<Notification<T>> {
  return this.lift(new MaterializeOperator());
}

export interface MaterializeSignature<T> {
  (): Observable<Notification<T>>;
}

class MaterializeOperator<T> implements Operator<T, Notification<T>> {
  call(subscriber: Subscriber<Notification<T>>): Subscriber<T> {
    return new MaterializeSubscriber(subscriber);
  }
}

class MaterializeSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<Notification<T>>) {
    super(destination);
  }

  protected _next(value: T) {
    this.destination.next(Notification.createNext(value));
  }

  protected _error(err: any) {
    const destination = this.destination;
    destination.next(Notification.createError(err));
    destination.complete();
  }

  protected _complete() {
    const destination = this.destination;
    destination.next(Notification.createComplete());
    destination.complete();
  }
}
