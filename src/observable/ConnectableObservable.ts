import {Subject} from '../Subject';
import {Operator} from '../Operator';
import {Observer} from '../Observer';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';

/**
 * @class ConnectableObservable<T>
 */
export class ConnectableObservable<T> extends Observable<T> {

  protected _subject: Subject<T>;
  protected _refCount: number = 0;
  protected _connection: Subscription;

  constructor(protected source: Observable<T>,
              protected subjectFactory: () => Subject<T>) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    return this.getSubject().subscribe(subscriber);
  }

  protected getSubject(): Subject<T> {
    return this._subject || (this._subject = this.subjectFactory());
  }

  connect(): Subscription {
    let connection = this._connection;
    if (!connection) {
      connection = this.source.subscribe(new ConnectableSubscriber(this.getSubject(), this));
      if (connection.isUnsubscribed) {
        this._connection = null;
        connection = Subscription.EMPTY;
      } else {
        this._connection = connection;
      }
    }
    return connection;
  }

  refCount(): Observable<T> {
    return this.lift(new RefCountOperator<T>(this));
  }
}

class ConnectableSubscriber<T> extends Subscriber<T> {
  constructor(destination: Observer<T>,
              private connectable: ConnectableObservable<T>) {
    super(destination);
  }
  protected _error(err: any): void {
    this._unsubscribe();
    super._error(err);
  }
  protected _complete(): void {
    this._unsubscribe();
    super._complete();
  }
  protected _unsubscribe() {
    const { connectable } = this;
    if (connectable) {
      this.connectable = null;
      (<any> connectable)._refCount = 0;
      (<any> connectable)._subject = null;
      (<any> connectable)._connection = null;
    }
  }
}

class RefCountOperator<T> implements Operator<T, T> {
  constructor(private connectable: ConnectableObservable<T>) {
  }
  call(subscriber: Subscriber<T>, source: any): any {

    const { connectable } = this;
    (<any> connectable)._refCount++;

    const refCounter = new RefCountSubscriber(subscriber, connectable);
    const subscription = source._subscribe(refCounter);

    if (!refCounter.isUnsubscribed) {
      (<any> refCounter).connection = connectable.connect();
    }

    return subscription;
  }
}

class RefCountSubscriber<T> extends Subscriber<T> {

  private connection: Subscription;

  constructor(destination: Subscriber<T>,
              private connectable: ConnectableObservable<T>) {
    super(destination);
  }

  protected _unsubscribe() {

    const { connectable } = this;
    if (!connectable) {
      this.connection = null;
      return;
    }

    this.connectable = null;
    const refCount = (<any> connectable)._refCount;
    if (refCount <= 0) {
      this.connection = null;
      return;
    }

    (<any> connectable)._refCount = refCount - 1;
    if (refCount > 1) {
      this.connection = null;
      return;
    }

    const { connection } = this;
    if (connection) {
      this.connection = null;
      connection.unsubscribe();
    }
  }
}
