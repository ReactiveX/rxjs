import {Operator} from './Operator';
import {Observer} from './Observer';
import {Observable} from './Observable';
import {Subscriber} from './Subscriber';
import {Subscription} from './Subscription';
import {SubjectSubscription} from './subject/SubjectSubscription';
import {rxSubscriber} from './symbol/rxSubscriber';

import {throwError} from './util/throwError';
import {ObjectUnsubscribedError} from './util/ObjectUnsubscribedError';

export class Subject<T> extends Observable<T> implements Observer<T>, Subscription {

  static create: Function = <T>(destination: Observer<T>, source: Observable<T>): Subject<T> => {
    return new Subject<T>(destination, source);
  };

  public observers: Observer<T>[] = [];
  public isUnsubscribed: boolean = false;

  public add: (subscription: Subscription|Function|void) => void;
  public remove: (subscription: Subscription) => void;
  public unsubscribe: () => void;

  // for backwards compatability with <= Rx4
  public onNext: (value: T) => void;
  public onError: (error: any) => void;
  public onCompleted: () => void;
  public dispose: () => void;

  protected isStopped: boolean = false;
  protected hasErrored: boolean = false;
  protected errorValue: any;
  protected dispatching: boolean = false;
  protected hasCompleted: boolean = false;

  constructor(protected destination?: Observer<T>, protected source?: Observable<T>) {
    super();
  }

  lift<T, R>(operator: Operator<T, R>): Observable<T> {
    const subject = new Subject(this.destination || this, this);
    subject.operator = operator;
    return <any>subject;
  }

  protected _subscribe(subscriber: Subscriber<T>): Subscription | Function | void {
    if (this.source) {
      return this.source.subscribe(subscriber);
    } else {
      if (subscriber.isUnsubscribed) {
        return;
      } else if (this.hasErrored) {
        return subscriber.error(this.errorValue);
      } else if (this.hasCompleted) {
        return subscriber.complete();
      }

      this.throwIfUnsubscribed();

      const subscription = new SubjectSubscription(this, subscriber);

      this.observers.push(subscriber);

      return subscription;
    }
  }

  protected _unsubscribe(): void {
    this.source = null;
    this.isStopped = true;
    this.observers = null;
    this.destination = null;
  }

  next(value: T): void {
    this.throwIfUnsubscribed();

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
    this.throwIfUnsubscribed();

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
    this.throwIfUnsubscribed();

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

  asObservable(): Observable<T> {
    const observable = new SubjectObservable(this);
    return observable;
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

  private throwIfUnsubscribed(): void {
    if (this.isUnsubscribed) {
      throwError(new ObjectUnsubscribedError());
    }
  }

  [rxSubscriber]() {
    return new Subscriber<T>(this);
  }
}

Subject.prototype.add = Subscription.prototype.add;
Subject.prototype.remove = Subscription.prototype.remove;
Subject.prototype.unsubscribe = Subscription.prototype.unsubscribe;

Subject.prototype.onNext = Subject.prototype.next;
Subject.prototype.onError = Subject.prototype.error;
Subject.prototype.onCompleted = Subject.prototype.complete;
Subject.prototype.dispose = Subject.prototype.unsubscribe;

class SubjectObservable<T> extends Observable<T> {
  constructor(source: Subject<T>) {
    super();
    this.source = source;
  }
}
