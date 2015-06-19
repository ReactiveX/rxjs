import Observer from '../Observer';
import error_obj from '../util/errorObject';
import Observable from '../Observable';
import Subscription from '../Subscription';
import SerialSubscription from '../SerialSubscription';

interface IteratorResult<T> {
	done:boolean;
	value?:T
}

class MapToObserver extends Observer {
  value:any;
  
  constructor(destination:Observer, subscription:Subscription, value:any) {
    super(destination, subscription);
    this.value = value;
  }
  
  _next(_:any):IteratorResult<any> {
    return this.destination.next(this.value);
  }
}

class MapToObservable extends Observable {
  source:Observable;
	value:any;
  
  constructor(source:Observable, value:any) {
    super(null);
    this.source = source;
    this.value = value;
  }
  
  subscriber(observer:Observer):Subscription {
    var subscription = new SerialSubscription(null);
    return Subscription.from(this.source.subscriber(new MapToObserver(observer, subscription, this.value)));
  }
}

export default function mapTo(value:any) : Observable {
  return new MapToObservable(this, value);
};
