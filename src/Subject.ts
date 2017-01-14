import { Operator } from './Operator';
import { Observer } from './Observer';
import { Observable } from './Observable';
import { Subscriber } from './Subscriber';
import { ISubscription, Subscription } from './Subscription';
import { ObjectUnsubscribedError } from './util/ObjectUnsubscribedError';
import { SubjectSubscription } from './SubjectSubscription';
import { $$rxSubscriber } from './symbol/rxSubscriber';

/**
 * @class SubjectSubscriber<T>
 */
export class SubjectSubscriber<T> extends Subscriber<T> {
  constructor(protected destination: Subject<T>) {
    super(destination);
  }
}

export interface ISubject<T> extends ISubscription, Observable<T>, Observer<T> {
  readonly closed: boolean;
  asObservable(): Observable<T>;
}

/**
 * @class Subject<T>
 */
export class Subject<T> extends Observable<T> implements ISubject<T> {

  [$$rxSubscriber]() {
    return new SubjectSubscriber(this);
  }

  protected observers: Observer<T>[] = [];
  protected isStopped = false;
  protected hasError = false;
  protected thrownError: any = null;
  closed = false;

  constructor() {
    super();
  }

  static create: Function = <T>(destination: Observer<T>, source: Observable<T>): ISubject<T> => {
    return new AnonymousSubject<T>(destination, source);
  }

  public lift<R>(operator: Operator<T, R>): Observable<T> {
    const subject = new AnonymousSubject(this, this);
    subject.operator = <any>operator;
    return <any>subject;
  }

  public next(value?: T): void {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    if (!this.isStopped) {
      const { observers } = this;
      const len = observers.length;
      const copy = observers.slice();
      for (let i = 0; i < len; i++) {
        copy[i].next(value);
      }
    }
  }

  public error(err: any): void {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    this.hasError = true;
    this.thrownError = err;
    this.isStopped = true;
    const { observers } = this;
    const len = observers.length;
    const copy = observers.slice();
    for (let i = 0; i < len; i++) {
      copy[i].error(err);
    }
    this.observers.length = 0;
  }

  public complete(): void {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    this.isStopped = true;
    const { observers } = this;
    const len = observers.length;
    const copy = observers.slice();
    for (let i = 0; i < len; i++) {
      copy[i].complete();
    }
    this.observers.length = 0;
  }

  public unsubscribe(): void {
    this.isStopped = true;
    this.closed = true;
    this.observers = null;
  }

  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else if (this.hasError) {
      subscriber.error(this.thrownError);
      return Subscription.EMPTY;
    } else if (this.isStopped) {
      subscriber.complete();
      return Subscription.EMPTY;
    } else {
      this.observers.push(subscriber);
      return new SubjectSubscription(this, subscriber);
    }
  }

  public asObservable(): Observable<T> {
    const observable = new Observable<T>();
    (<any>observable).source = this;
    return observable;
  }
}

/**
 * @class AnonymousSubject<T>
 */
export class AnonymousSubject<T> extends Subject<T> {
  constructor(protected destination?: Observer<T>, source?: Observable<T>) {
    super();
    this.source = source;
  }

  public next(value: T): void {
    const { destination } = this;
    if (destination && destination.next) {
      destination.next(value);
    }
  }

  public error(err: any): void {
    const { destination } = this;
    if (destination && destination.error) {
      this.destination.error(err);
    }
  }

  public complete(): void {
    const { destination } = this;
    if (destination && destination.complete) {
      this.destination.complete();
    }
  }

  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    const { source } = this;
    if (source) {
      return this.source.subscribe(subscriber);
    } else {
      return Subscription.EMPTY;
    }
  }
}
