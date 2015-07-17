import Subscriber from '../Subscriber';
import SerialSubscription from '../SerialSubscription';
import CompositeSubscription from '../CompositeSubscription';
import Observable from '../Observable';
import $$observer from '../util/Symbol_observer';
import SubscriberFactory from '../SubscriberFactory';

class MergeAllSubscriber extends Subscriber {
  buffer:Array<any>;
  concurrent:number;
  stopped:boolean = false;
  
  constructor(destination:Subscriber, concurrent:number) {
    super(destination);
    this.buffer = [];
    this.concurrent = concurrent;
  }
  
  next(observable) {
    var buffer = this.buffer;
    var concurrent = this.concurrent;
    var subscriptions = this.subscriptions;

    if (subscriptions.length < concurrent) {
      var innerSubscriber = new MergeInnerSubscriber(this);
      this.add(innerSubscriber);
      innerSubscriber.add(observable[$$observer](innerSubscriber));
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
  
  _innerComplete(innerSubscriber:MergeInnerSubscriber) {
    var buffer = this.buffer;

    this.remove(innerSubscriber);

    if(this.subscriptions.length < this.concurrent) {
      if (buffer && buffer.length > 0) {
        this.next(buffer.shift());
      } else if (this.stopped && this.subscriptions.length === 0) {
        return this.destination.complete();
      }
    }
  }
}

class MergeInnerSubscriber extends Subscriber {
  parent:MergeAllSubscriber;
  
  constructor(parent:MergeAllSubscriber) {
    super(parent.destination);
    this.parent = parent;
  }
  
  _complete(value: any) {
    return this.parent._innerComplete(this);
  }
}

class MergeAllSubscriberFactory extends SubscriberFactory {
  concurrent: number;
  
  constructor(concurrent: number) {
    super();
    this.concurrent = concurrent;
  }
  
  create(destination: Subscriber): Subscriber {
    return new MergeAllSubscriber(destination, this.concurrent);
  }
}

export default function mergeAll(concurrent: number = Number.POSITIVE_INFINITY): Observable {
  return this.lift(new MergeAllSubscriberFactory(concurrent));
};