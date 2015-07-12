import Observer from '../Observer';
import Observable from '../Observable';
import Subscription from '../Subscription';
import ObserverFactory from '../ObserverFactory';

class SkipObserver extends Observer {
  count:number;
  counter:number=0;
  
  constructor(destination:Observer, count:number) {
    super(destination);
    this.count = count;
  }
  
  _next(value:any) {
    if(this.counter++ >= this.count) {
      return this.destination.next(value);
    }
  }
}

class SkipObserverFactory extends ObserverFactory {
  count:number;
  
  constructor(count:number) {
    super();
    this.count = count;
  }
  
  create(destination: Observer): Observer {
    return new SkipObserver(destination, this.count);
  }
}

export default function skip(count:number) : Observable {
  return this.lift(new SkipObserverFactory(count));
};
