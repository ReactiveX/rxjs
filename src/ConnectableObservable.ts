import Observable from './Observable';
import Subscriber from './Subscriber';
import $$observer from './util/Symbol_observer';
import { Subscription } from './Subscription';
import Subject from './Subject';
import nextTick from './scheduler/nextTick';

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
    return nextTick.schedule(0, this, dispatchConnection);
  }
  
  connectSync() : Subscription {
    return dispatchConnection(this);
  }
  
  [$$observer](subscriber: Subscriber) {
    if (!(subscriber instanceof Subscriber)) {
      subscriber = new Subscriber(subscriber);
    }
    if (!this.subject || this.subject.unsubscribed) {
      if (this.subscription) {
        this.subscription = undefined;
      }
      this.subject = this.subjectFactory();
    }
    return this.subject[$$observer](subscriber);
  }
  
  refCount() : Observable {
    return new RefCountObservable(this);
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
    this.source[$$observer](subscriber);
    
    var shouldConnect = this.refCount === 1;
    if (shouldConnect) {
      this.connectionSubscription = this.source.connectSync();
    }

    return () => {
      var refCount = this.refCount--;
      if (refCount === 0) {
        this.connectionSubscription.unsubscribe();
      }
    };
  }
}

function dispatchConnection(connectable) {
  if (!connectable.subscription) {
    if (!connectable.subject) {
      connectable.subject = connectable.subjectFactory();
    }
    connectable.subscription = connectable.source.subscribe(connectable.subject);
  }
  return connectable.subscription;
}