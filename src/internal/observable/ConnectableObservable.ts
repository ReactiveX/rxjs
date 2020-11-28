/** @prettier */
import { Subject } from '../Subject';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { refCount as higherOrderRefCount } from '../operators/refCount';
import { OperatorSubscriber } from '../operators/OperatorSubscriber';

/**
 * @class ConnectableObservable<T>
 * @deprecated To be removed in version 8. Please use {@link connectable} to create a connectable observable.
 * If you are using the `refCount` method of `ConnectableObservable` you can use the updated {@link share} operator
 * instead, which is now highly configurable.
 */
export class ConnectableObservable<T> extends Observable<T> {
  protected _subject: Subject<T> | null = null;
  protected _refCount: number = 0;
  protected _connection: Subscription | null = null;

  /**
   * @param source The source observable
   * @param subjectFactory The factory that creates the subject used internally.
   * @deprecated To be removed in version 8. Please use {@link connectable} to create a connectable observable.
   * If you are using the `refCount` method of `ConnectableObservable` you can use the {@link share} operator
   * instead, which is now highly configurable. `new ConnectableObservable(source, fn)` is equivalent
   * to `connectable(source, fn)`. With the exception of when the `refCount()` method is needed, in which
   * case, the new {@link share} operator should be used: `new ConnectableObservable(source, fn).refCount()`
   * is equivalent to `source.pipe(share({ connector: fn }))`.
   */
  constructor(public source: Observable<T>, protected subjectFactory: () => Subject<T>) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    return this.getSubject().subscribe(subscriber);
  }

  protected getSubject(): Subject<T> {
    const subject = this._subject;
    if (!subject || subject.isStopped) {
      this._subject = this.subjectFactory();
    }
    return this._subject!;
  }

  protected _teardown() {
    this._refCount = 0;
    const { _connection } = this;
    this._subject = this._connection = null;
    _connection?.unsubscribe();
  }

  connect(): Subscription {
    let connection = this._connection;
    if (!connection) {
      connection = this._connection = new Subscription();
      const subject = this.getSubject();
      connection.add(
        this.source.subscribe(
          new OperatorSubscriber(
            subject as any,
            undefined,
            (err) => {
              this._teardown();
              subject.error(err);
            },
            () => {
              this._teardown();
              subject.complete();
            },
            () => this._teardown()
          )
        )
      );

      if (connection.closed) {
        this._connection = null;
        connection = Subscription.EMPTY;
      }
    }
    return connection;
  }

  /**
   * @deprecated The {@link ConnectableObservable} class is scheduled for removal in version 8.
   * Please use the {@link share} operator, which is now highly configurable.
   */
  refCount(): Observable<T> {
    return higherOrderRefCount()(this) as Observable<T>;
  }
}
