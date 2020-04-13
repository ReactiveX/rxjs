import { Operator } from './Operator';
import { Observable } from './Observable';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { Observer, SubscriptionLike, TeardownLogic } from './types';
import { ObjectUnsubscribedError } from './util/ObjectUnsubscribedError';
import { SubjectSubscription } from './SubjectSubscription';
import { rxSubscriber as rxSubscriberSymbol } from '../internal/symbol/rxSubscriber';

export class SubjectSubscriber<T> extends Subscriber<T> {
  constructor(protected destination: Subject<T>) {
    super(destination);
  }
}

/**
 * A Subject is a both an observer and an observable.
 *
 * The main use cases for a Subject in RxJS are:
 *
 * 1. To multicast an observable. That is, to allow many subscribers to subscribe
 * to a single subscription to a source observable. This can be accomplished with
 * various operators, or with Subject alone.
 * 2. As a bridge between event handling systems that only allow one handler and
 * creating an observable of those events. For example, registering an event handler
 * via JSX in React, or via a template in Angular.
 *
 * **TypeScript Users**
 *
 * Note that because Subject was developed against older versions of TypeScript, the
 * `next` method is incorrectly typed, as `next(value?): void` and always allows `value` to be optional.
 * This was done to provide better ergonomics for TypeScript users, so that they may
 * call `subject.next()` if they are using a `Subject<void>(). This is incorrect,
 * and we experimented with fixing it in v7, however we are unable to fix it until a later version
 * because of the number of builds it would break. We want to have linting in place
 * to make sure we migrate users gracefully.
 *
 * If you want to call `subject.next()` without an argument, you must be using a
 * `Subject<void>` or a `Subject<T | void>`.
 */
export class Subject<T> extends Observable<T> implements SubscriptionLike, Observer<T> {

  [rxSubscriberSymbol]() {
    return new SubjectSubscriber(this);
  }

  observers: Observer<T>[] = [];

  /**
   * Whether or not the subject is closed.
   * @deprecated Will be `readonly` in the future
   */
  closed = false;

  /**
   * @deprecated do not read or set, this was for internal use only
   */
  isStopped = false;

  /**
   * @deprecated do not read or set, this was for internal use only
   */
  hasError = false;

  /**
   * @deprecated do not read or set, this was for internal use only
   */
  thrownError: any = null;

  /**
   * @nocollapse
   * @deprecated use new Subject() instead
   */
  static create: Function = <T>(destination: Observer<T>, source: Observable<T>): AnonymousSubject<T> => {
    return new AnonymousSubject<T>(destination, source);
  }

  lift<R>(operator: Operator<T, R>): Observable<R> {
    const subject = new AnonymousSubject(this, this);
    subject.operator = <any>operator;
    return <any>subject;
  }

  /**
   * Next a value through the subject to all subscribers. Only works if
   * the subject is not `closed`.
   *
   * **Typings incorrect here**. See class documentation.
   * @param value
   */
  next(value?: T) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    if (!this.isStopped) {
      const { observers } = this;
      const len = observers.length;
      const copy = observers.slice();
      for (let i = 0; i < len; i++) {
        copy[i].next(value!);
      }
    }
  }

  error(err: any) {
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

  complete() {
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

  /**
   * Calling `unsubscribe` will clean up the subscriptions to this
   * subject, and also cause the subject to throw errors on any
   * action against it.
   */
  unsubscribe() {
    this.isStopped = true;
    this.closed = true;
    this.observers = null!;
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  _trySubscribe(subscriber: Subscriber<T>): TeardownLogic {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else {
      return super._trySubscribe(subscriber);
    }
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  _subscribe(subscriber: Subscriber<T>): Subscription {
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

  /**
   * Creates a new Observable with this Subject as the source. You can do this
   * to create customize Observer-side logic of the Subject and conceal it from
   * code that uses the Observable.
   * @return {Observable} Observable that the Subject casts to
   */
  asObservable(): Observable<T> {
    const observable = new Observable<T>();
    (<any>observable).source = this;
    return observable;
  }
}

export class AnonymousSubject<T> extends Subject<T> {
  constructor(protected destination?: Observer<T>, source?: Observable<T>) {
    super();
    this.source = source;
  }

  next(value: T) {
    const { destination } = this;
    if (destination && destination.next) {
      destination.next(value);
    }
  }

  error(err: any) {
    const { destination } = this;
    if (destination && destination.error) {
      this.destination!.error(err);
    }
  }

  complete() {
    const { destination } = this;
    if (destination && destination.complete) {
      this.destination!.complete();
    }
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  _subscribe(subscriber: Subscriber<T>): Subscription {
    const { source } = this;
    if (source) {
      return this.source!.subscribe(subscriber);
    } else {
      return Subscription.EMPTY;
    }
  }
}
