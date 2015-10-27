import Operator from './Operator';
import Observer from './Observer';
import Observable from './Observable';
import Subscriber from './Subscriber';
import Subscription from './Subscription';
import SubjectSubscription from './subjects/SubjectSubscription';

const subscriptionAdd = Subscription.prototype.add;
const subscriptionRemove = Subscription.prototype.remove;
const subscriptionUnsubscribe = Subscription.prototype.unsubscribe;

const subscriberNext = Subscriber.prototype.next;
const subscriberError = Subscriber.prototype.error;
const subscriberComplete = Subscriber.prototype.complete;
const _subscriberNext = Subscriber.prototype._next;
const _subscriberError = Subscriber.prototype._error;
const _subscriberComplete = Subscriber.prototype._complete;


export default class Subject<T> extends Observable<T> implements Observer<T>, Subscription<T> {
  _subscriptions: Subscription<T>[];
  _unsubscribe: () => void;

  static create<T>(source: Observable<T>, destination: Observer<T>): Subject<T> {
    return new BidirectionalSubject(source, destination);
  }

  protected destination: Observer<T>;

  observers: Observer<T>[] = [];
  isUnsubscribed: boolean = false;

  dispatching: boolean = false;
  errorSignal: boolean = false;
  errorInstance: any;
  completeSignal: boolean = false;

  lift<T, R>(operator: Operator<T, R>): Observable<T> {
    const subject = new BidirectionalSubject(this, this.destination || this);
    subject.operator = operator;
    return subject;
  }

  _subscribe(subscriber: Subscriber<any>): Subscription<T> {
    if (subscriber.isUnsubscribed) {
      return;
    } else if (this.errorSignal) {
      subscriber.error(this.errorInstance);
      return;
    } else if (this.completeSignal) {
      subscriber.complete();
      return;
    } else if (this.isUnsubscribed) {
      throw new Error("Cannot subscribe to a disposed Subject.");
    }

    this.observers.push(subscriber);

    return new SubjectSubscription(this, subscriber);
  }

  add(subscription?) {
    subscriptionAdd.call(this, subscription);
  }

  remove(subscription?) {
    subscriptionRemove.call(this, subscription);
  }

  unsubscribe() {
    this.observers = void 0;
    subscriptionUnsubscribe.call(this);
  }

  next(value: T): void {
    if (this.isUnsubscribed) {
      return;
    }

    this.dispatching = true;
    this._next(value);
    this.dispatching = false;

    if (this.errorSignal) {
      this.error(this.errorInstance);
    } else if (this.completeSignal) {
      this.complete();
    }
  }

  error(err?: any): void {
    if (this.isUnsubscribed || this.completeSignal) {
      return;
    }

    this.errorSignal = true;
    this.errorInstance = err;

    if (this.dispatching) {
      return;
    }

    this._error(err);
    this.unsubscribe();
  }

  complete(): void {
    if (this.isUnsubscribed || this.errorSignal) {
      return;
    }

    this.completeSignal = true;

    if (this.dispatching) {
      return;
    }

    this._complete();
    this.unsubscribe();
  }


  _next(value: T): void {
    let index = -1;
    const observers = this.observers.slice(0);
    const len = observers.length;

    while (++index < len) {
      observers[index].next(value);
    }
  }

  _error(err: any): void{
    let index = -1;
    const observers = this.observers;
    const len = observers.length;

    // optimization -- block next, complete, and unsubscribe while dispatching
    this.observers = void 0;
    this.isUnsubscribed = true;

    while(++index < len) {
      observers[index].error(err);
    }

    this.isUnsubscribed = false;
  }

  _complete(): void{
    let index = -1;
    const observers = this.observers;
    const len = observers.length;

    // optimization -- block next, complete, and unsubscribe while dispatching
    this.observers = void 0; // optimization
    this.isUnsubscribed = true;

    while (++index < len) {
      observers[index].complete();
    }

    this.isUnsubscribed = false;
  }
}

class BidirectionalSubject<T> extends Subject<T> {
  constructor(public source: Observable<any>, protected destination: Observer<any>) {
    super();
  }

  _subscribe(subscriber: Subscriber<T>): Subscription<T> {
    const operator = this.operator;
    return this.source._subscribe.call(this.source, operator ? operator.call(subscriber) : subscriber);
  }

  next(value?: T): void {
    subscriberNext.call(this, value);
  }

  error(err?: any): void {
    subscriberError.call(this, err);
  }

  complete(): void {
    subscriberComplete.call(this);
  }

  _next(value: T): void {
    _subscriberNext.call(this, value);
  }

  _error(err: any): void {
    _subscriberError.call(this, err);
  }

  _complete(): void {
    _subscriberComplete.call(this);
  }
}