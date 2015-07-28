import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

export default function takeUntil<T>(observable: Observable<any>) {
  return this.lift(new TakeUntilOperator(observable));
}

export class TakeUntilOperator<T, R> extends Operator<T, R> {

  constructor(protected observable: Observable<any>) {
    super();
  }

  call(observer: Observer<T>): Observer<T> {
    return new TakeUntilSubscriber(observer, this.observable);
  }
}

export class TakeUntilSubscriber<T> extends Subscriber<T> {
  constructor(destination: Observer<T>,
              observable: Observable<any>) {
    super(destination);
    this.add(observable.subscribe(new TakeUntilInnerSubscriber(destination)));
  }
}

export class TakeUntilInnerSubscriber<T> extends Subscriber<T> {
  constructor(public destination: Observer<T>) {
    super();
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