import {Operator} from './Operator';
import {Observer} from './Observer';
import {Observable} from './Observable';
import {Subscriber} from './Subscriber';
import {Subscription} from './Subscription';
import {SubjectSubscription} from './subject/SubjectSubscription';
import {rxSubscriber} from './symbol/rxSubscriber';

export class Subject<T> extends Observable<T> implements Observer<T>, Subscription {

  static create: Function = <T>(source: Observable<T>, destination: Observer<T>): Subject<T> => {
    return new Subject<T>(source, destination);
  };

  constructor(source?: Observable<T>, destination?: Observer<T>) {
    super();
    this.source = source;
    this.destination = destination;
  }

  public observers: Observer<T>[] = [];
  public isUnsubscribed: boolean = false;

  protected destination: Observer<T>;

  protected isStopped: boolean = false;
  protected hasErrored: boolean = false;
  protected errorValue: any;
  protected dispatching: boolean = false;
  protected hasCompleted: boolean = false;

  lift<T, R>(operator: Operator<T, R>): Observable<T> {
    const subject = new Subject(this, this.destination || this);
    subject.operator = operator;
    return <any>subject;
  }

  add(subscription: Subscription|Function|void): void {
    Subscription.prototype.add.call(this, subscription);
  }

  remove(subscription: Subscription): void {
    Subscription.prototype.remove.call(this, subscription);
  }

  unsubscribe(): void {
    Subscription.prototype.unsubscribe.call(this);
  }

  _subscribe(subscriber: Subscriber<T>): Subscription | Function | void {
    if (this.source) {
      return this.source.subscribe(subscriber);
    } else {
      if (subscriber.isUnsubscribed) {
        return;
      } else if (this.hasErrored) {
        return subscriber.error(this.errorValue);
      } else if (this.hasCompleted) {
        return subscriber.complete();
      } else if (this.isUnsubscribed) {
        throw new Error('Cannot subscribe to a disposed Subject.');
      }

      const subscription = new SubjectSubscription(this, subscriber);

      this.observers.push(subscriber);

      return subscription;
    }
  }

  _unsubscribe(): void {
    this.source = null;
    this.isStopped = true;
    this.observers = null;
    this.destination = null;
  }

  next(value: T): void {
    if (this.isStopped) {
      return;
    }

    this.dispatching = true;
    this._next(value);
    this.dispatching = false;

    if (this.hasErrored) {
      this._error(this.errorValue);
    } else if (this.hasCompleted) {
      this._complete();
    }
  }

  error(err?: any): void {
    if (this.isStopped) {
      return;
    }

    this.isStopped = true;
    this.hasErrored = true;
    this.errorValue = err;

    if (this.dispatching) {
      return;
    }

    this._error(err);
  }

  complete(): void {
    if (this.isStopped) {
      return;
    }

    this.isStopped = true;
    this.hasCompleted = true;

    if (this.dispatching) {
      return;
    }

    this._complete();
  }

  protected _next(value: T): void {
    if (this.destination) {
      this.destination.next(value);
    } else {
      this._finalNext(value);
    }
  }

  protected _finalNext(value: T): void {
    let index = -1;
    const observers = this.observers.slice(0);
    const len = observers.length;

    while (++index < len) {
      observers[index].next(value);
    }
  }

  protected _error(err: any): void {
    if (this.destination) {
      this.destination.error(err);
    } else {
      this._finalError(err);
    }
  }

  protected _finalError(err: any): void {
    let index = -1;
    const observers = this.observers;

    // optimization to block our SubjectSubscriptions from
    // splicing themselves out of the observers list one by one.
    this.observers = null;
    this.isUnsubscribed = true;

    if (observers) {
      const len = observers.length;
      while (++index < len) {
        observers[index].error(err);
      }
    }

    this.isUnsubscribed = false;

    this.unsubscribe();
  }

  protected _complete(): void {
    if (this.destination) {
      this.destination.complete();
    } else {
      this._finalComplete();
    }
  }

  protected _finalComplete(): void {
    let index = -1;
    const observers = this.observers;

    // optimization to block our SubjectSubscriptions from
    // splicing themselves out of the observers list one by one.
    this.observers = null;
    this.isUnsubscribed = true;

    if (observers) {
      const len = observers.length;
      while (++index < len) {
        observers[index].complete();
      }
    }

    this.isUnsubscribed = false;

    this.unsubscribe();
  }

  [rxSubscriber]() {
    return new Subscriber<T>(this);
  }
}
