import Observer from '../Observer';
import Observable from '../Observable';
import Subscription from '../Subscription';
import SerialSubscription from '../SerialSubscription';

interface IteratorResult<T> {
	done:boolean;
	value?:T
}

class TakeObserver extends Observer {
  count:number;
	counter:number=0;
  
  constructor(destination:Observer, subscription:Subscription, count:number) {
    super(destination, subscription);
    this.count = count;
  }
  
  _next(value:any):IteratorResult<any> {
		if(this.counter++ < this.count) {
			return this.destination.next(value);
		} else {
      return this.destination.return();
    }
  }
}

class TakeObservable extends Observable {
  source:Observable;
	count:number;
  
  constructor(source:Observable, count:number) {
    super(null);
    this.source = source;
    this.count = count;
  }
  
  subscriber(observer:Observer):Subscription {
    var subscription = new SerialSubscription(null);
    return Subscription.from(this.source.subscriber(new TakeObserver(observer, subscription, this.count)));
  }
}

export default function take(count:number) : Observable {
  return new TakeObservable(this, count);
};
