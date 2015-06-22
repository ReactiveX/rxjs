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
  _dispose:Function;
  
  dispose() {
    this.disposed = true;
    this.observers.length = 0;
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
    if(this.disposed) {
      return { done: true };
    }
    this.observers.forEach(o => o.next(value));
    return { done: false };
  }
  
  throw(err:any) : IteratorResult<any> {
    if(this.disposed) {
      return { done: true };
    }
    this.observers.forEach(o => o.throw(err));
    this.dispose();
    return { done: true };
  }

  return(value:any) : IteratorResult<any> {
    if(this.disposed) {
      return { done: true };
    }
    this.observers.forEach(o => o.return(value));
    this.dispose();
    return { done: true };
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