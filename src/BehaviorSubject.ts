import Observable from './Observable';
import Observer from './Observer';
import $$observer from './util/Symbol_observer';
import SerialSubscription from './SerialSubscription';
import Subscription from './Subscription';
import Subject from './Subject';

export default class BehaviorSubject extends Subject {
  value:any;
  
  constructor(value:any) {
    super();
    this.value = value;
  }
  
  [$$observer](observer:Observer) {
    this.observers.push(observer);
    var subscription = new Subscription(null, observer);
    this.next(this.value);
    return subscription;
  }
  
  next(value:any) {
    this.value = value;
    super.next(value);
  }
}