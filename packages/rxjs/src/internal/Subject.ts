import type { Subscriber} from '@rxjs/observable';
import { Observable, Subscription } from '@rxjs/observable';
import type { Observer, SubscriptionLike } from './types.js';

/**
 * A Subject is a special type of Observable that allows values to be
 * multicasted to many Observers. Subjects are like EventEmitters.
 *
 * Every Subject is an Observable and an Observer. You can subscribe to a
 * Subject, and you can call next to feed values as well as error and complete.
 */
export class Subject<T> extends Observable<T> implements SubscriptionLike {
  /** @internal */
  _closed = false;

  /**
   * Will return true if this subject has been closed and is no longer accepting new values.
   */
  get closed() {
    return this._closed;
  }

  private _observerCounter = 0;
  private currentObservers = new Map<number, Observer<T>>();

  /**
   * This is used to track a known array of observers, so we don't have to
   * clone them while iterating to prevent reentrant behaviors.
   * (for example, what if the subject is subscribed to when nexting to an observer)
   */
  private observerSnapshot: Observer<T>[] | undefined;

  /** @internal */
  get observers(): Observer<T>[] {
    return (this.observerSnapshot ??= Array.from(this.currentObservers.values()));
  }

  /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
  hasError = false;

  /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
  thrownError: any = null;

  constructor() {
    // NOTE: This must be here to obscure Observable's constructor.
    super();
  }

  protected _clearObservers() {
    this.currentObservers.clear();
    this.observerSnapshot = undefined;
  }

  next(value: T) {
    if (!this._closed) {
      const { observers } = this;
      const len = observers.length;
      for (let i = 0; i < len; i++) {
        observers[i].next(value);
      }
    }
  }

  error(err: any) {
    if (!this._closed) {
      this.hasError = this._closed = true;
      this.thrownError = err;
      const { observers } = this;
      const len = observers.length;
      for (let i = 0; i < len; i++) {
        observers[i].error(err);
      }
      this._clearObservers();
    }
  }

  complete() {
    if (!this._closed) {
      this._closed = true;
      const { observers } = this;
      const len = observers.length;
      for (let i = 0; i < len; i++) {
        observers[i].complete();
      }
      this._clearObservers();
    }
  }

  unsubscribe() {
    this._closed = true;
    this._clearObservers();
  }

  get observed() {
    return this.currentObservers.size > 0;
  }

  /** @internal */
  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    this._checkFinalizedStatuses(subscriber);
    return this._innerSubscribe(subscriber);
  }

  /** @internal */
  protected _innerSubscribe(subscriber: Subscriber<any>) {
    if (this.hasError || this._closed) {
      return Subscription.EMPTY;
    }
    const { currentObservers } = this;

    const observerId = this._observerCounter++;
    currentObservers.set(observerId, subscriber);
    this.observerSnapshot = undefined;
    subscriber.add(() => {
      currentObservers.delete(observerId);
      this.observerSnapshot = undefined;
    });
    return subscriber;
  }

  /** @internal */
  protected _checkFinalizedStatuses(subscriber: Subscriber<any>) {
    const { hasError, thrownError, _closed } = this;
    if (hasError) {
      subscriber.error(thrownError);
    } else if (_closed) {
      subscriber.complete();
    }
  }

  /**
   * Creates a new Observable with this Subject as the source. You can do this
   * to create custom Observer-side logic of the Subject and conceal it from
   * code that uses the Observable.
   * @return Observable that this Subject casts to.
   */
  asObservable(): Observable<T> {
    return new Observable((subscriber) => this.subscribe(subscriber));
  }
}
