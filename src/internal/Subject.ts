import { Observable } from './Observable';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { Observer, SubscriptionLike, TeardownLogic } from './types';
import { ObjectUnsubscribedError } from './util/ObjectUnsubscribedError';

/**
 * A Subject is a special type of Observable that allows values to be
 * multicasted to many Observers. Subjects are like EventEmitters.
 *
 * Every Subject is an Observable and an Observer. You can subscribe to a
 * Subject, and you can call next to feed values as well as error and complete.
 */
export class Subject<T> extends Observable<T> implements 
SubscriptionLike {
  closed = false;

  /**
   * This is an optimization point. We use this to cache an array of
   * the current observers so we don't have to create a new iterator
   * or clone the array when processing emissions from the subject
   * in order to prevent reentrant behavior (where, for example, a `next` event
   * causes code to synchronously add a new observer to the subject)
   */
  private currentObservers: Observer<T>[] | null = null;

  /** @internal */
  observers = new Map<Subscription, Observer>()

  /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
  isStopped = false;
  /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
  hasError = false;
  /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
  thrownError: any = null;

  /**
   * Creates a "subject" by basically gluing an observer to an observable.
   *
   * @nocollapse
   * @deprecated Recommended you do not use. Will be removed at some point in the future. Plans for replacement still under discussion.
   */
  static create: (...args: any[]) => any = <T>(destination: Observer<T>, source: Observable<T>): AnonymousSubject<T> => {
    return new AnonymousSubject<T>(destination, source);
  };

  constructor() {
    // NOTE: This must be here to obscure Observable's constructor.
    super();
  }

  /** @internal */
  protected _throwIfClosed() {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
  }

  next(value: T) {
    this._throwIfClosed();
    if (!this.isStopped) {
      if (!this.currentObservers) {
        this.currentObservers = Array.from(this.observers.values());
      }
      const { currentObservers } = this
      const len = currentObservers.length
      for (let i = 0; i < len; i++) {
        currentObservers[i].next(value);
      }
    }
  }

  error(err: any) {
    this._throwIfClosed();
    if (!this.isStopped) {
      this.hasError = this.isStopped = true;
      this.thrownError = err;
      const { currentObservers } = this
      const len = currentObservers.length
      for (let i = 0; i < len; i++) {
        currentObservers[i].error(err);
      }
    }
  }

  complete() {
    this._throwIfClosed();
    if (!this.isStopped) {
      this.isStopped = true;
      const { currentObservers } = this
      const len = currentObservers.length
      for (let i = 0; i < len; i++) {
        currentObservers[i].complete();
      }
    }
  }

  unsubscribe() {
    this.isStopped = this.closed = true;
    this.observers.clear()
    this.currentObservers = null;
  }

  get observed() {
    return this.observers.size > 0;
  }

  /** @internal */
  protected _trySubscribe(subscriber: Subscriber<T>): TeardownLogic {
    this._throwIfClosed();
    return super._trySubscribe(subscriber);
  }

  /** @internal */
  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    // this._throwIfClosed();
    this._checkFinalizedStatuses(subscriber);
    return this._innerSubscribe(subscriber);
  }

  /** @internal */
  protected _innerSubscribe(subscriber: Subscriber<any>) {
    const { hasError, isStopped, observers } = this;
    if (hasError || isStopped) {
      return Subscription.EMPTY;
    }
    const subscription = new Subscription(() => {
      this.currentObservers = null;
      observers.delete(subscription)
    });
    observers.set(subscription, subscriber);
    return subscription;
  }

  /** @internal */
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
   * to create custom Observer-side logic of the Subject and conceal it from
   * code that uses the Observable.
   * @return {Observable} Observable that the Subject casts to
   */
  asObservable(): Observable<T> {
    return new Observable((subscriber) => this.subscribe(subscriber));
  }
}

/**
 * @class AnonymousSubject<T>
 */
export class AnonymousSubject<T> extends Subject<T> {
  constructor(
    /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
    public destination?: Observer<T>,
    /** @internal */
    protected _source?: Observable<T>
  ) {
    super();
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

  /** @internal */
  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    return this._source?.subscribe(subscriber) ?? Subscription.EMPTY;
  }
}
