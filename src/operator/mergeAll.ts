import Observer from '../Observer';
import Subscription from '../Subscription';
import SerialSubscription from '../SerialSubscription';
import CompositeSubscription from '../CompositeSubscription';
import Observable from '../Observable';
import $$observer from '../util/Symbol_observer';
import ObserverFactory from '../ObserverFactory';

class MergeAllObserver extends Observer {
  buffer:Array<any>;
  concurrent:number;
  subscriptions:CompositeSubscription;
  stopped:boolean = false;
  
  constructor(destination:Observer, concurrent:number) {
    super(destination);
    this.buffer = [];
    this.concurrent = concurrent;
    this.subscriptions = new CompositeSubscription();
  }
  
  next(observable) {
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
  }
  
  complete(value: any) {
    this.stopped = true;
    if(this.subscriptions.length === 0 && (this.buffer && this.buffer.length === 0)) {
      this.destination.complete(value);
    }
  }
  
  _innerComplete(innerObserver:MergeInnerObserver) {
    var buffer = this.buffer;
    var subscriptions = this.subscriptions;

    subscriptions.remove(innerObserver.subscription);

    if(subscriptions.length < this.concurrent) {
      if (buffer && buffer.length > 0) {
        this.next(buffer.shift());
      } else if (this.stopped && subscriptions.length === 0) {
        return this.destination.complete();
      }
    }
  }
  
  unsubscribe() {
    super.unsubscribe();
    this.subscriptions.unsubscribe();
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
  
  _complete(value: any) {
    return this.parent._innerComplete(this);
  }
}

class MergeAllObserverFactory extends ObserverFactory {
  concurrent: number;
  
  constructor(concurrent: number) {
    super();
    this.concurrent = concurrent;
  }
  
  create(destination: Observer): Observer {
    return new MergeAllObserver(destination, this.concurrent);
  }
}

export default function mergeAll(concurrent: number = Number.POSITIVE_INFINITY): Observable {
  return this.lift(new MergeAllObserverFactory(concurrent));
};