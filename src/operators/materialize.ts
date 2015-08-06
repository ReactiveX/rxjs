import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Notification from '../Notification';

export default function materialize<T>() {
  return this.lift(new MaterializeOperator());
}

export class MaterializeOperator<T, R> extends Operator<T, R> {
  call(observer: Observer<T>): Observer<T> {
    return new MaterializeSubscriber(observer);
  }
}

export class MaterializeSubscriber<T> extends Subscriber<T> {
  constructor(destination: Observer<T>) {
    super(destination);
  }

  _next(value:T) {
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
