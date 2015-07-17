import Observable from './Observable';
import Subscriber from './Subscriber';
import $$observer from './util/Symbol_observer';
import { Subscription } from './Subscription';
import Subject from './Subject';

export default class ConnectableObservable extends Observable {
  source: Observable;
  subjectFactory: () => Subject;
  subscription: Subscription;
  subject: Subject;
  
  constructor(source:Observable, subjectFactory:()=>Subject) {
    super(null);
    this.source = source;
    this.subjectFactory = subjectFactory;
  }
  
  connect(): Subscription {
    if (!this.subscription) {
      this.subscription = this.source.subscribe(this.subject);
    }
    return this.subscription;
  }
  
  [$$observer](subscriber: Subscriber) {
    if (!(subscriber instanceof ConnectableSubscriber)) {
      subscriber = new ConnectableSubscriber(subscriber, this);
    }

    if (!this.subject || this.subject.isUnsubscribed) {
      
      if (this.subscription) {
        this.subscription.unsubscribe();
        this.subscription = undefined;
      }

      this.subject = this.subjectFactory();
    }

    this.subject.subscribe(subscriber);
    
    return subscriber;
  }
  
  refCount() : Observable {
    return new RefCountObservable(this);
  }
}

class ConnectableSubscriber extends Subscriber {
  source: ConnectableObservable;
  
  constructor(destination: Subscriber, source: ConnectableObservable) {
    super(destination);
    this.source = source;
  }
  
  _complete(value: any) {
    this.source.subject.remove(this);
    super._complete(value);
  }
}

class RefCountObservable extends Observable {
  refCount: number = 0;
  source:ConnectableObservable;
  connectionSubscription: Subscription;
  
  constructor(source: ConnectableObservable) {
    super(null);
    this.source = source;
  }
  
  subscriber(subscriber) {
    this.refCount++;
    this.source.subscribe(subscriber);
    
    var shouldConnect = this.refCount === 1;
    if (shouldConnect) {
      this.connectionSubscription = this.source.connect();
    }

    // HACK: closure, refactor soon    
    return () => {
      this.refCount--;
      if (this.refCount === 0) {
        this.connectionSubscription.unsubscribe();
      }
    };
  }
}