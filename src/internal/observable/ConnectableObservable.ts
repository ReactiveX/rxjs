/** @prettier */
import { Subject } from '../Subject';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { refCount as higherOrderRefCount } from '../operators/refCount';

/**
 * @class ConnectableObservable<T>
 */
export class ConnectableObservable<T> extends Observable<T> {
  protected _subject: Subject<T> | undefined;
  protected _refCount: number = 0;
  protected _connection: Subscription | null | undefined;
  /** @internal */
  _isComplete = false;

  constructor(public source: Observable<T>, protected subjectFactory: () => Subject<T>) {
    super();
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  _subscribe(subscriber: Subscriber<T>) {
    return this.getSubject().subscribe(subscriber);
  }

  protected getSubject(): Subject<T> {
    const subject = this._subject;
    if (!subject || subject.isStopped) {
      this._subject = this.subjectFactory();
    }
    return this._subject!;
  }

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

  refCount(): Observable<T> {
    return higherOrderRefCount()(this) as Observable<T>;
  }
}

export const connectableObservableDescriptor: PropertyDescriptorMap = (() => {
  const connectableProto = <any>ConnectableObservable.prototype;
  return {
    operator: { value: null as null },
    _refCount: { value: 0, writable: true },
    _subject: { value: null as null, writable: true },
    _connection: { value: null as null, writable: true },
    _subscribe: { value: connectableProto._subscribe },
    _isComplete: { value: connectableProto._isComplete, writable: true },
    getSubject: { value: connectableProto.getSubject },
    connect: { value: connectableProto.connect },
    refCount: { value: connectableProto.refCount },
  };
})();

class ConnectableSubscriber<T> extends Subscriber<T> {
  constructor(protected destination: Subject<T>, private connectable: ConnectableObservable<T>) {
    super();
  }

  protected _error(err: any): void {
    this._teardown();
    super._error(err);
  }

  protected _complete(): void {
    this.connectable._isComplete = true;
    this._teardown();
    super._complete();
  }

  private _teardown() {
    const connectable = this.connectable as any;
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

  unsubscribe() {
    if (!this.closed) {
      this._teardown();
      super.unsubscribe();
    }
  }
}
