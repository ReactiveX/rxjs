import Observable from './Observable';
import Subscriber from './Subscriber';
import $$observer from './util/Symbol_observer';
import SerialSubscription from './SerialSubscription';
import { Subscription } from './Subscription';
import Subject from './Subject';

export default class BehaviorSubject extends Subject {
  value:any;
  
  constructor(value:any) {
    super();
    this.value = value;
  }
  
  [$$observer](subscriber:Subscriber) : Subscription {
    this.subscribers.push(subscriber);
    this.next(this.value);
    return subscriber;
  }
  
  next(value:any) {
    this.value = value;
    super.next(value);
  }
}