import Observable from './Observable';
import Observer from './Observer';
import $$observer from './util/Symbol_observer';
import Subscription from './Subscription';
import Subject from './Subject';
import nextTick from './scheduler/nextTick';

export default class ConnectableObservable extends Observable {
  source: Observable;
  subjectFactory: ()=>Subject;
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
  
  [$$observer](observer: Observer) {
    if (!(observer instanceof Observer)) {
      observer = new Observer(observer);
    }
    if (!this.subject || this.subject.unsubscribed) {
      if (this.subscription) {
        this.subscription = undefined;
      }
      this.subject = this.subjectFactory();
    }
    return this.subject[$$observer](observer);
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