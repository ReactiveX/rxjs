import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import Subscription from '../Subscription';

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

class SwitchSubscriber<T> extends Subscriber<T> {
  private active: number = 0;
  private hasCompleted: boolean = false;
  innerSubscription: Subscription<T>;

  constructor(destination: Observer<T>) {
    super(destination);
  }
  
  _next(value: any) {
    this.active++;
    this.unsubscribeInner();
    this.add(this.innerSubscription = value.subscribe(new InnerSwitchSubscriber(this))); 
  }
  
  _complete() {
    this.hasCompleted = true;
    if(this.active === 0) {
      this.destination.complete();
    }
  }
  
  unsubscribeInner() {
    const innerSubscription = this.innerSubscription;
    if(innerSubscription) {
      this.active--;
      innerSubscription.unsubscribe();
      this.remove(innerSubscription);
    }
  }
  
  notifyNext(value: T) {
    this.destination.next(value);
  }
  
  notifyError(err: any) {
    this.destination.error(err);
  }
  
  notifyComplete() {
    this.unsubscribeInner();
    if(this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
  }
}

class InnerSwitchSubscriber<T> extends Subscriber<T> {
  constructor(private parent: SwitchSubscriber<T>) {
    super();
  }
  
  _next(value: T) {
    this.parent.notifyNext(value);
  }
  
  _error(err: any) {
    this.parent.notifyError(err);
  }
  
  _complete() {
    this.parent.notifyComplete();
  }
}

