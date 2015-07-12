import Observable from '../Observable';
import Observer from '../Observer';
import Subscription from '../Subscription';
import ObserverFactory from '../ObserverFactory';

class ToArrayObserver extends Observer {
  array:Array<any> = [];
  
  constructor(destination:Observer) {
    super(destination);
  }
  
  _next(value: any) {
    this.array.push(value);
  }
  
  _complete(value: any) {
    this.destination.next(this.array);
    this.destination.complete(value);
  }
}

class ToArrayObserverFactory extends ObserverFactory {  
  create(destination: Observer): Observer {
    return new ToArrayObserver(destination);
  }
}

export default function toArray(): Observable {
  return this.lift(new ToArrayObserverFactory());
}