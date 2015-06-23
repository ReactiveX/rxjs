import Observable from './Observable';
import Observer from './Observer';
import $$observer from './util/Symbol_observer';
import SerialSubscription from './SerialSubscription';
import Subscription from './Subscription';

export interface IteratorResult<T> {
  value?:T;
  done:boolean;
}

export default class Subject extends Observable {
  destination:Observer;
  disposed:boolean=false;
  observers:Array<Observer> = [];
  _dispose:()=>void;
  unsubscribed: boolean = false;
  _next: (value: any) => IteratorResult<any>;
  _throw: (err: any) => IteratorResult<any>;
  _return: (value: any) => IteratorResult<any>;
  
  
  dispose() {
    this.disposed = true;
    if(this._dispose) {
      this._dispose();
    }
  }
  
  [$$observer](observer:Observer) : Subscription {
    this.observers.push(observer);
    var subscription = new Subscription(null, observer);
    return subscription;
  }
  
  next(value:any) : IteratorResult<any> {
    if(this.unsubscribed) {
      return { done: true };
    }
    this.observers.forEach(o => o.next(value));
    this._cleanUnsubbedObservers();
    return { done: false };
  }
  
  throw(err:any) : IteratorResult<any> {
    if(this.unsubscribed) {
      return { done: true };
    }
    this.observers.forEach(o => o.throw(err));
    this.unsubscribe();
    this._cleanUnsubbedObservers();
    return { done: true };
  }

  return(value:any) : IteratorResult<any> {
    if(this.unsubscribed) {
      return { done: true };
    }
    this.observers.forEach(o => o.return(value));
    this.unsubscribe();
    this._cleanUnsubbedObservers();
    return { done: true };
  } 
  
  _cleanUnsubbedObservers() {
    var i;
    var observers = this.observers;
    for (i = observers.length; i--;) {
      if (observers[i].unsubscribed) {
        observers.splice(i, 1);
      }
    }
    if (observers.length === 0) {
      this.unsubscribe();
    }
  }
  
  unsubscribe() {
    this.observers.length = 0;
    this.unsubscribed = true;
  }
}

class SubjectSubscription extends Subscription {
  subject:Subject;
  
  constructor(observer:Observer, subject:Subject) {
    super(null, observer);
    this.subject = subject; 
  }
  
  unsubscribe() {
    var observers = this.subject.observers;
    var index = observers.indexOf(this.observer);
    if(index !== -1) {
      observers.splice(index, 1);
    }
    super.unsubscribe();
  }
}