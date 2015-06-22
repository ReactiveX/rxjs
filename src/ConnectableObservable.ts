import Observable from './Observable';
import Observer from './Observer';
import $$observer from './util/Symbol_observer';
import Subscription from './Subscription';
import Subject from './Subject';

export default class ConnectableObservable extends Observable {
  source: Observable;
  subject: Subject;
  subscription: Subscription;
  
  constructor(source:Observable, subject:Subject) {
    super(null);
    this.source = source;
    this.subject = subject;
  }
  
  connect() : Subscription {
    if (!this.subscription) {
      this.subscription = this.source.subscribe(this.subject);
    }
    return this.subscription;
  }
  
  [$$observer](observer: Observer) {
    return this.subject[$$observer](observer);
  }
}