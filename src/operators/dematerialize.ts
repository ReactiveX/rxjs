import Operator from '../Operator';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import Notification from '../Notification';

export default function dematerialize<T>(): Observable<any> {
  return this.lift(new DeMaterializeOperator());
}

class DeMaterializeOperator<T extends Notification<any>, R> implements Operator<T, R> {
  call(subscriber: Subscriber<any>) {
    return new DeMaterializeSubscriber(subscriber);
  }
}

class DeMaterializeSubscriber<T extends Notification<any>> extends Subscriber<T> {
  constructor(destination: Subscriber<any>) {
    super(destination);
  }

  _next(value: T) {
    value.observe(this.destination);
  }
}
