/** @prettier */
import { Operator } from './Operator';
import { Observable } from './Observable';
import { Subscriber } from './Subscriber';
import { Subscription, EMPTY_SUBSCRIPTION } from './Subscription';
import { Observer, SubscriptionLike, TeardownLogic } from './types';
import { ObjectUnsubscribedError } from './util/ObjectUnsubscribedError';
import { arrRemove } from './util/arrRemove';

/**
 * A Subject is a special type of Observable that allows values to be
 * multicasted to many Observers. Subjects are like EventEmitters.
 *
 * Every Subject is an Observable and an Observer. You can subscribe to a
 * Subject, and you can call next to feed values as well as error and complete.
 */
export class Subject<T> extends Observable<T> implements SubscriptionLike {
  observers: Observer<T>[] = [];

  closed = false;

  isStopped = false;

  hasError = false;

  thrownError: any = null;

  /**
   * Creates a "subject" by basically gluing an observer to an observable.
   *
   * @nocollapse
   * @deprecated Recommended you do not use, will be removed at some point in the future. Plans for replacement still under discussion.
   */
  static create: (...args: any[]) => any = <T>(destination: Observer<T>, source: Observable<T>): AnonymousSubject<T> => {
    return new AnonymousSubject<T>(destination, source);
  };

  constructor() {
    // NOTE: This must be here to obscure Observable's constructor.
    super();
  }

  lift<R>(operator: Operator<T, R>): Observable<R> {
    const subject = new AnonymousSubject(this, this);
    subject.operator = operator as any;
    return subject as any;
  }

  protected _throwIfClosed() {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
  }

  next(value: T) {
    this._throwIfClosed();
    if (!this.isStopped) {
      const copy = this.observers.slice();
      for (const observer of copy) {
        observer.next(value);
      }
    }
  }

  error(err: any) {
    this._throwIfClosed();
    if (!this.isStopped) {
      this.hasError = this.isStopped = true;
      this.thrownError = err;
      const { observers } = this;
      while (observers.length) {
        observers.shift()!.error(err);
      }
    }
  }

  complete() {
    this._throwIfClosed();
    if (!this.isStopped) {
      this.isStopped = true;
      const { observers } = this;
      while (observers.length) {
        observers.shift()!.complete();
      }
    }
  }

  unsubscribe() {
    this.isStopped = this.closed = true;
    this.observers = null!;
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  protected _trySubscribe(subscriber: Subscriber<T>): TeardownLogic {
    this._throwIfClosed();
    return super._trySubscribe(subscriber);
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    this._throwIfClosed();
    this._checkFinalizedStatuses(subscriber);
    return this._innerSubscribe(subscriber);
  }

  protected _innerSubscribe(subscriber: Subscriber<any>) {
    const { hasError, isStopped, observers } = this;
    return hasError || isStopped
      ? EMPTY_SUBSCRIPTION
      : (observers.push(subscriber), new Subscription(() => arrRemove(this.observers, subscriber)));
  }

  protected _checkFinalizedStatuses(subscriber: Subscriber<any>) {
    const { hasError, thrownError, isStopped } = this;
    if (hasError) {
      subscriber.error(thrownError);
    } else if (isStopped) {
      subscriber.complete();
    }
  }
  /**
   * Creates a new Observable with this Subject as the source. You can do this
   * to create customize Observer-side logic of the Subject and conceal it from
   * code that uses the Observable.
   * @return {Observable} Observable that the Subject casts to
   */
  asObservable(): Observable<T> {
    const observable: any = new Observable<T>();
    observable.source = this;
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

  next(value: T) {
    this.destination?.next?.(value);
  }

  error(err: any) {
    this.destination?.error?.(err);
  }

  complete() {
    this.destination?.complete?.();
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  _subscribe(subscriber: Subscriber<T>): Subscription {
    return this.source?.subscribe(subscriber) ?? EMPTY_SUBSCRIPTION;
  }
}
