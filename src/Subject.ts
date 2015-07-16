import Observable from './Observable';
import Subscriber from './Subscriber';
import $$observer from './util/Symbol_observer';
import SerialSubscription from './SerialSubscription';
import { Subscription } from './Subscription';

export default class Subject extends Observable {
  destination:Subscriber;
  disposed:boolean=false;
  subscribers:Array<Subscriber> = [];
  _dispose:()=>void;
  unsubscribed: boolean = false;
  _next: (value: any) => void;
  _error: (err: any) => void;
  _complete: (value: any) => void;
  
  constructor() {
    super(null);
  }
  
  dispose() {
    this.disposed = true;
    if(this._dispose) {
      this._dispose();
    }
  }
  
  [$$observer](observer: Subscriber): Subscription {
    var subscriber = new Subscriber(observer);
    this.subscribers.push(subscriber);
    return subscriber;
  }
  
  next(value: any) {
    if(this.unsubscribed) {
      return;
    }
    this.subscribers.forEach(o => o.next(value));
    this._cleanUnsubbedSubscribers();
  }
  
  error(err: any) {
    if(this.unsubscribed) {
      return;
    }
    this.subscribers.forEach(o => o.error(err));
    this.unsubscribe();
    this._cleanUnsubbedSubscribers();
  }

  complete(value: any) {
    if(this.unsubscribed) {
      return;
    }
    this.subscribers.forEach(o => o.complete(value));
    this.unsubscribe();
    this._cleanUnsubbedSubscribers();
  } 
  
  _cleanUnsubbedSubscribers() {
    var i;
    var subscribers = this.subscribers;
    for (i = subscribers.length; i--;) {
      if (subscribers[i].isUnsubscribed) {
        subscribers.splice(i, 1);
      }
    }
    if (subscribers.length === 0) {
      this.unsubscribe();
    }
  }
  
  unsubscribe() {
    this.subscribers.length = 0;
    this.unsubscribed = true;
  }
}