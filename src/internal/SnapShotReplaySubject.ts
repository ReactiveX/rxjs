import { Subject } from './Subject';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { ObjectUnsubscribedError } from './util/ObjectUnsubscribedError';
import { SubjectSubscription } from './SubjectSubscription';
/**
 * A variant of Subject that "replays" or emits old values to new subscribers.
 * It buffers a set number of values and will emit those values immediately to
 * any new subscribers in addition to emitting new values to existing subscribers.
 * Values are keyed by the provided functor
 * Keeps maps of latest Values by key
 *
 * @class SnapShotReplaySubject<T>
 */
export class SnapShotReplaySubject<T> extends Subject<T> {
  private _eventsMap: Map<any, T> = new Map<any, T>();

  private _keyProvider: (value: T) => any;

  constructor(keyProvider: (value: T) => any) {
    super();
    this._keyProvider = keyProvider;
    this.next = this.keyedNext;
  }

  private keyedNext(value: T): void {
    const key = this._keyProvider(value);
    this._eventsMap.set(key, value);
    super.next(value);
  }


  /** @deprecated This is an internal implementation detail, do not use. */
  _subscribe(subscriber: Subscriber<T>): Subscription {

    let subscription: Subscription;

    if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else if (this.isStopped || this.hasError) {
      subscription = Subscription.EMPTY;
    } else {
      this.observers.push(subscriber);
      subscription = new SubjectSubscription(this, subscriber);
    }

    const values = Array.from(this._eventsMap.values());

    values.forEach(value => {
      subscriber.next(value);
    });

    if (this.hasError) {
      subscriber.error(this.thrownError);
    } else if (this.isStopped) {
      subscriber.complete();
    }

    return subscription;
  }

}
