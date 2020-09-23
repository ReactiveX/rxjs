/** @prettier */
import { Subject } from '../Subject';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { refCount as higherOrderRefCount } from '../operators/refCount';
import { OperatorSubscriber } from '../operators/OperatorSubscriber';

/**
 * @class ConnectableObservable<T>
 */
export class ConnectableObservable<T> extends Observable<T> {
  protected _subject: Subject<T> | null = null;
  protected _refCount: number = 0;
  protected _connection: Subscription | null = null;

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

  refCount(): Observable<T> {
    return higherOrderRefCount()(this) as Observable<T>;
  }
}
