import {Operator} from './Operator';
import {Observer} from './Observer';
import {Observable} from './Observable';
import {Subscriber} from './Subscriber';
import {ISubscription, Subscription} from './Subscription';
import {ObjectUnsubscribedError} from './util/ObjectUnsubscribedError';
import {SubjectSubscription} from './SubjectSubscription';
import {$$rxSubscriber} from './symbol/rxSubscriber';

/**
 * @class SubjectSubscriber<T>
 */
export class SubjectSubscriber<T> extends Subscriber<T> {
  constructor(protected destination: SubjectBase<T>) {
    super(destination);
  }
}

export abstract class SubjectBase<T> extends Observable<T> implements ISubscription {
  [$$rxSubscriber]() {
    return new SubjectSubscriber(this);
  }

  observers: Observer<T>[] = [];
  closed = false;
  isStopped = false;
  hasError = false;
  thrownError: any = null;

  constructor() {
    super();
  }

  lift<T, R>(operator: Operator<T, R>): Observable<T> {
    const subject = new AnonymousSubject(this, this);
    subject.operator = operator;
    return <any>subject;
  }

  next(value?: T): void {
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

  error(err: any): void {
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

  complete(): void {
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

  unsubscribe() {
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

  asObservable(): Observable<T> {
    const observable = new Observable<T>();
    (<any>observable).source = this;
    return observable;
  }
}

/**
 * @class Subject<T>
 */
export class Subject<T> extends SubjectBase<T> {
  static create: Function = <T>(destination: Observer<T>, source: Observable<T>): AnonymousSubject<T> => {
    return new AnonymousSubject<T>(destination, source);
  };
}

/**
 * @class AnonymousSubject<T>
 */
export class AnonymousSubject<T> extends SubjectBase<T> {
  constructor(protected destination?: Observer<T>, source?: Observable<T>) {
    super();
    this.source = source;
  }

  next(value: T): void {
    const { destination } = this;
    if (destination && destination.next) {
      destination.next(value);
    }
  }

  error(err: any): void {
    const { destination } = this;
    if (destination && destination.error) {
      this.destination.error(err);
    }
  }

  complete(): void {
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
