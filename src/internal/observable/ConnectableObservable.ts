import { Subject, SubjectSubscriber } from '../Subject';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { ObservableInput, TimestampProvider } from '../types';
import { refCount } from '../operators/refCount';
import { from } from './from';
import { ReplaySubject } from '../ReplaySubject';
import { BehaviorSubject } from '../BehaviorSubject';

/**
 * An observable that connects a single subscription to a source, through a subject,
 * to multiple subscribers, when `connect()` is called on it.
 *
 * Subclassing is not recommended.
 */
export class ConnectableObservable<T> extends Observable<T> {
  protected _subject: Subject<T> | undefined;
  protected _refCount: number = 0;
  protected _connection: Subscription | null | undefined;
  /** @internal */
  _isComplete = false;

  /**
   * Creates a new ConnectableObservable.
   * Do not use directly. Instead, use {@link multicastFrom}.
   *
   * @param source The source observable to subcribe to upon connection
   * @param subjectFactory A factor function used to create the `Subject` that
   * connects the source to all subscribers.
   */
  constructor(public source: Observable<T>, protected subjectFactory: () => Subject<T>) {
    super();
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  _subscribe(subscriber: Subscriber<T>) {
    return this.getSubject().subscribe(subscriber);
  }

  /** @deprecated Implementation detail, do not use */
  protected getSubject(): Subject<T> {
    const subject = this._subject;
    if (!subject || subject.isStopped) {
      this._subject = this.subjectFactory();
    }
    return this._subject!;
  }

  /**
   * Connects all current and future subscribers to this observable
   * to the source observable
   */
  connect(): Subscription {
    let connection = this._connection;
    if (!connection) {
      this._isComplete = false;
      connection = this._connection = new Subscription();
      connection.add(this.source.subscribe(new ConnectableSubscriber(this.getSubject(), this)));
      if (connection.closed) {
        this._connection = null;
        connection = Subscription.EMPTY;
      }
    }
    return connection;
  }

  /**
   * Returns an Observable that will count the number of active subscriptions to
   * the connectable observable, and:
   *
   * 1. Increments the active subscriptions count for each subscription to the resulting observable
   * 2. When the active subscriptions count goes from 0 to 1, will "connect" the `ConnectableObservable` automatically.
   * 3. Unsubscribing from the resulting observable will decrement the active subscriptions count.
   * 4. If the active subscriptions count returns to zero, the "connection" will be terminated, and the
   *    subscription to the source observable will be unsubscribed.
   */
  refCount(): Observable<T> {
    return refCount<T>()(this);
  }
}

class ConnectableSubscriber<T> extends SubjectSubscriber<T> {
  constructor(destination: Subject<T>, private connectable: ConnectableObservable<T>) {
    super(destination);
  }
  protected _error(err: any): void {
    this._unsubscribe();
    super._error(err);
  }
  protected _complete(): void {
    this.connectable._isComplete = true;
    this._unsubscribe();
    super._complete();
  }
  protected _unsubscribe() {
    const connectable = <any>this.connectable;
    if (connectable) {
      this.connectable = null!;
      const connection = connectable._connection;
      connectable._refCount = 0;
      connectable._subject = null;
      connectable._connection = null;
      if (connection) {
        connection.unsubscribe();
      }
    }
  }
}

/**
 * Multicasts values from a single subscription to an observable source, through a subject.
 *
 * Requires "connection".
 *
 * This returns a {@link ConnectableObservable}, that connects a single observable subscription
 * to many subscribers through a created subject.
 *
 * Subscribers to the returned observable will actually be subscribing to the subject provided by
 * the second argument. When `connect()` is called on the returned `ConnectableObservable`, that
 * subject is used to create a single subscription to the observable source provided as the `input`
 * argument, and that {@link Subscription} is returned. If you `unsubscribe` from the subscription
 * returned by `connect()`, all subscribers will be "disconnected" and stop recieving notifications.
 *
 * When the subscription to the shared source, provided via the `input` argument, is torn down,
 * either by completion of the source, an error from the source, or "disconnection" via calling `unsubscribe`
 * on the `Subscription` returned by `connect()`, one of two things will happen:
 *
 * 1. If you provided a factory function that creates a `Subject`, the subject state is "reset", and you
 *    may reconnect, which will call the subject factor and create a new Subject for use with the new connection.
 * 2. If you provided a `Subject` directly, that subject instance will remain the subject new subscriptions
 *    will attempt to "connect" through, however, that `Subject` will likely be "closed", thus meaning that
 *    the returned `ConnectableObservable` cannot be retried or repeated.
 *
 * Note that multicasting in this manner is not generally recommended, but RxJS provides this functionality
 * for the following generalized cases:
 *
 * 1. Multicasting synchronous emissions from an observable source.
 * 2. Multicasting through a custom `Subject` in a "connectable" way.
 * 3. Both 1 and 2.
 *
 * In most cases, if you want to share values from a single subscription to an observable to
 * multiple subscribers, you really should be using the {@link share} operator.
 *
 * ### Example
 *
 * ```ts
 * import { range, multicastFrom } from 'rxjs';
 * import { finalize } from 'rxjs/operators';
 *
 * const source = range(0, 5).pipe(
 *  finalize(() => console.log('finalized'))
 * );
 *
 * const published = multicastFrom(source, () => new Subject());
 *
 * published.subscribe(x => console.log('A', x));
 * published.subscribe(x => console.log('B', x));
 *
 * // Nothing happens until you connect
 * const subcription = publish.connect();
 *
 * // subscription.unsubscribe() will disconnect all subscribers.
 * ```
 * @param input The observable input to publish
 * @param subjectFactoryOrSubject A Subject instance, or a function used to create the subject upon connection
 */
export function multicastFrom<T>(
  input: ObservableInput<T>,
  subjectFactoryOrSubject: Subject<T> | (() => Subject<T>)
): ConnectableObservable<T> {
  const subjectFactory =
    typeof subjectFactoryOrSubject === 'function' ? subjectFactoryOrSubject : () => subjectFactoryOrSubject;
  return new ConnectableObservable<T>(from(input), subjectFactory);
}

/**
 * Identical to {@link multicastFrom} called as `multicastFrom(input, new Subject())`
 */
export function publishFrom<T>(input: ObservableInput<T>) {
  return multicastFrom(input, new Subject<T>());
}

/**
 * Identical to {@link multicastFrom} called as `multicastFrom(input, new ReplaySubject<T>(bufferSize, windowTime, timestampProvider);`
 */
export function publishReplayFrom<T>(
  input: ObservableInput<T>,
  bufferSize?: number,
  windowTime?: number,
  timestampProvider?: TimestampProvider
) {
  return multicastFrom(input, new ReplaySubject<T>(bufferSize, windowTime, timestampProvider));
}

/**
 * Identical to {@link multicastFrom} called as `multicastFrom(input, new BehaviorSubject<T>(initialValue);`
 */
export function publishBehaviorFrom<T>(input: ObservableInput<T>, initialValue: T) {
  return multicastFrom(input, new BehaviorSubject<T>(initialValue));
}
