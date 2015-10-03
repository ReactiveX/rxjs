import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import Subscription from '../Subscription';
import OuterSubscriber from '../OuterSubscriber';
import subscribeToResult from '../util/subscribeToResult';

export default function _switch<T>(): Observable<T> {
  return this.lift(new SwitchOperator());
}

class SwitchOperator<T, R> implements Operator<T, R> {

  constructor() {
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new SwitchSubscriber(subscriber);
  }
}

class SwitchSubscriber<T, R> extends OuterSubscriber<T, R> {
  private active: number = 0;
  private hasCompleted: boolean = false;
  innerSubscription: Subscription<T>;

  constructor(destination: Observer<T>) {
    super(destination);
  }

  _next(value: any) {
    this.unsubscribeInner();
    this.active++;
    this.add(this.innerSubscription = subscribeToResult(this, value));
  }

  _complete() {
    this.hasCompleted = true;
    if (this.active === 0) {
      this.destination.complete();
    }
  }

  unsubscribeInner() {
    this.active = this.active > 0 ? this.active - 1 : 0;
    const innerSubscription = this.innerSubscription;
    if (innerSubscription) {
      innerSubscription.unsubscribe();
      this.remove(innerSubscription);
    }
  }

  notifyNext(outerValue: T, innerValue: any) {
    this.destination.next(innerValue);
  }

  notifyError(err: any) {
    this.destination.error(err);
  }

  notifyComplete() {
    this.unsubscribeInner();
    if (this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
  }
}

