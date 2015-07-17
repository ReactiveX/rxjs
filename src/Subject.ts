import Observable from './Observable';
import Subscriber from './Subscriber';
import $$observer from './util/Symbol_observer';
import SerialSubscription from './SerialSubscription';
import { Subscription } from './Subscription';
import { Observer } from './Observer';

export default class Subject extends Observable implements Observer, Subscription {
  destination:Subscriber;
  disposed:boolean=false;
  subscribers:Array<Subscriber> = [];
  isUnsubscribed: boolean = false;
  _next: (value: any) => void;
  _error: (err: any) => void;
  _complete: (value: any) => void;
  
  constructor() {
    super(null);
  }
  
  [$$observer](subscriber: Subscriber): Subscription {
    if (!(subscriber instanceof Subscriber)) {
      subscriber = new Subscriber(subscriber);
    }
    this.add(subscriber);
    
    //HACK: return a subscription that will remove the subscriber from the list
    return <Subscription>{
      subscriber: subscriber,
      subject: this,
      isUnsubscribed: false,
      add() { },
      remove() { },
      unsubscribe() {
        this.isUnsubscribed = true;
        this.subscriber.unsubscribe;
        this.subject.remove(this.subscriber);
      }
    };
  }
  
  next(value: any) {
    if(this.isUnsubscribed) {
      return;
    }
    this.subscribers.forEach(o => o.next(value));
  }
  
  error(err: any) {
    if(this.isUnsubscribed) {
      return;
    }
    this.subscribers.forEach(o => o.error(err));
    this.unsubscribe();
  }

  complete(value: any) {
    if(this.isUnsubscribed) {
      return;
    }
    this.subscribers.forEach(o => o.complete(value));
    this.unsubscribe();
  }
  
  add(subscriber: Subscriber) {
    this.subscribers.push(subscriber);
  }
  
  remove(subscriber: Subscriber) {
    let index = this.subscribers.indexOf(subscriber);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }  
  }
  
  unsubscribe() {
    this.subscribers.length = 0;
    this.isUnsubscribed = true;
  }
}