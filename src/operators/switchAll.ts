import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import Subscription from '../Subscription';

export default function switchAll<T>(): Observable<T> {
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
    this.add(this.innerSubscription = value.subscribe(new InnerSwitchSubscriber(this.destination, this))); 
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
  
  notifyComplete() {
    this.unsubscribeInner();
    if(this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
  }
}

class InnerSwitchSubscriber<T> extends Subscriber<T> {
  constructor(destination: Observer<any>, private parent: SwitchSubscriber<T>) {
    super(destination);
  }
  
  _next(value: T) {
    super._next(value);
  }
  _complete() {
    this.parent.notifyComplete();
  }
}

