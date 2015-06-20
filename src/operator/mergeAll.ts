import Observer from '../Observer';
import Subscription from '../Subscription';
import SerialSubscription from '../SerialSubscription';
import CompositeSubscription from '../CompositeSubscription';
import Observable from '../Observable';
import $$observer from '../util/Symbol_observer';

interface IteratorResult<T> {
  value?:T;
  done:boolean;
}


class MergeAllObserver extends Observer {
  buffer:Array<any>;
  concurrent:number;
  subscriptions:CompositeSubscription;
  
  constructor(destination:Observer, concurrent:number) {
    super(destination);
    this.buffer = [];
    this.concurrent = concurrent;
    this.subscriptions = new CompositeSubscription();
  }
  
  _next(observable):IteratorResult<any> {
    var buffer = this.buffer;
    var concurrent = this.concurrent;
    var subscriptions = this.subscriptions;

    if (subscriptions.length < concurrent) {
      var innerSubscription = new SerialSubscription(null);
      var innerObserver = new MergeInnerObserver(this, innerSubscription);
      subscriptions.add(innerSubscription);
      innerSubscription.add(observable[$$observer](innerObserver));
    } else if (buffer) {
      buffer.push(observable);
    }
    
    return { done: false };
  }
  
  _return() : IteratorResult<any> {
    var buffer = this.buffer;
    var subscriptions = this.subscriptions;

    if (subscriptions.length === 0 && (!buffer || buffer.length === 0)) {
        return this.destination.return();
    }
    
    return { done: true };
  }
  
  _innerReturn(innerObserver:MergeInnerObserver) : IteratorResult<any> {
    var buffer = this.buffer;
    var subscriptions = this.subscriptions;

    subscriptions.remove(innerObserver.subscription);

    if(subscriptions.length < this.concurrent) {
      if (buffer && buffer.length > 0) {
        this.next(buffer.shift());
      } else if (subscriptions.length === 0) {
        return this.destination.return();
      }
    }
    return { done: true };
  }
}

class MergeInnerObserver extends Observer {
  parent:MergeAllObserver;
  subscription:Subscription;
  
  constructor(parent:MergeAllObserver, subscription:Subscription) {
    super(parent.destination);
    this.parent = parent;
    this.subscription = subscription;
  }
  
  _return() {
    return this.parent._innerReturn(this);
  }
}

class MergeAllObservable extends Observable {
  concurrent:number;
  source:Observable;
  
  constructor(source:Observable, concurrent:number) {
    super(null)
    this.source = source;
    this.concurrent = concurrent;  
  }
  
  subscriber(observer):Subscription {
    var mergeAllObserver = new MergeAllObserver(observer, this.concurrent);
    return Subscription.from(this.source.subscriber(mergeAllObserver), mergeAllObserver);
  }
}

export default function mergeAll(concurrent:number=Number.POSITIVE_INFINITY) : Observable {
    return new MergeAllObservable(this, concurrent);
};