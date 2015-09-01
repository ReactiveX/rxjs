import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

export default function takeUntil<T>(observable: Observable<any>) {
  return this.lift(new TakeUntilOperator(observable));
}

class TakeUntilOperator<T, R> implements Operator<T, R> {

  observable: Observable<any>;

  constructor(observable: Observable<any>) {
    this.observable = observable;
  }

  call(observer: Observer<T>): Observer<T> {
    return new TakeUntilSubscriber(observer, this.observable);
  }
}

class TakeUntilSubscriber<T> extends Subscriber<T> {
  constructor(destination: Observer<T>,
              observable: Observable<any>) {
    super(destination);
    this.add(observable.subscribe(new TakeUntilInnerSubscriber(destination)));
  }
}

class TakeUntilInnerSubscriber<T> extends Subscriber<T> {
  constructor(destination: Observer<T>) {
    super(destination);
  }
  _next() {
    this.destination.complete();
  }
  _error(e) {
    this.destination.error(e);
  }
  _complete() {
  }
}