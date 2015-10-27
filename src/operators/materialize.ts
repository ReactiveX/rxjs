import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Notification from '../Notification';

export default function materialize<T>() {
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
