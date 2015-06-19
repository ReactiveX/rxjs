import Observer from '../Observer';
import Observable from '../Observable';
import Subscription from '../Subscription';
import SerialSubscription from '../SerialSubscription';

interface IteratorResult<T> {
	done:boolean;
	value?:T
}

class SkipObserver extends Observer {
  count:number;
	counter:number=0;
  
  constructor(destination:Observer, subscription:Subscription, count:number) {
    super(destination, subscription);
    this.count = count;
  }
  
  _next(value:any):IteratorResult<any> {
		if(this.counter++ >= this.count) {
			return this.destination.next(value);
		}
		return { done: false };
  }
}

class SkipObservable extends Observable {
  source:Observable;
	count:number;
  
  constructor(source:Observable, count:number) {
    super(null);
    this.source = source;
    this.count = count;
  }
  
  subscriber(observer:Observer):Subscription {
    var subscription = new SerialSubscription(null);
    return Subscription.from(this.source.subscriber(new SkipObserver(observer, subscription, this.count)));
  }
}

export default function skip(count:number) : Observable {
  return new SkipObservable(this, count);
};
