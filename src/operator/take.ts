import Observer from '../Observer';
import Observable from '../Observable';
import Subscription from '../Subscription';
import ObserverFactory from '../ObserverFactory';

class TakeObserver extends Observer {
  count:number;
  counter:number=0;
  
  constructor(destination:Observer, count:number) {
    super(destination);
    this.count = count;
  }
  
  _next(value:any) {
    if(this.counter++ < this.count) {
      this.destination.next(value);
    } else {
      this.destination.complete();
    }
  }
}

class TakeObserverFactory extends ObserverFactory {
  count:number;
  
  constructor(count:number) {
    super();
    this.count = count;
  }
  
  create(destination: Observer): Observer {
    return new TakeObserver(destination, this.count);
  }
}

export default function take(count:number) : Observable {
  return this.lift(new TakeObserverFactory(count));
};
