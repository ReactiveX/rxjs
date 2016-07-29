import {Subject, SubjectSubscriber} from '../Subject';
import {Operator} from '../Operator';
import {Observable, IObservable} from '../Observable';
import {ISubscriber, Subscriber} from '../Subscriber';
import {ISubscription, Subscription, TeardownLogic} from '../Subscription';

export interface IConnectableObservable<T> extends IObservable<T> { }
export interface ConnectableObservable<T> extends IConnectableObservable<T> { }

/**
 * @class ConnectableObservable<T>
 */
export class ConnectableObservable<T> extends Observable<T> {

  protected _subject: Subject<T>;
  protected _refCount: number = 0;
  protected _connection: ISubscription;

  constructor(protected source: IObservable<T>,
              protected subjectFactory: () => Subject<T>) {
    super();
  }

  protected _subscribe(subscriber: ISubscriber<T>) {
    return this.getSubject().subscribe(subscriber);
  }

  protected getSubject(): Subject<T> {
    const subject = this._subject;
    if (!subject || subject.isStopped) {
      this._subject = this.subjectFactory();
    }
    return this._subject;
  }

  connect(): ISubscription {
    let connection = this._connection;
    if (!connection) {
      connection = this._connection = new Subscription();
      connection.add(this.source
        .subscribe(new ConnectableSubscriber(this.getSubject(), this)));
      if (connection.closed) {
        this._connection = null;
        connection = Subscription.EMPTY;
      } else {
        this._connection = connection;
      }
    }
    return connection;
  }

  refCount(): IObservable<T> {
    return this.lift(new RefCountOperator<T>(this));
  }
}

class ConnectableSubscriber<T> extends SubjectSubscriber<T> {
  constructor(destination: Subject<T>,
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
      const connection = (<any> connectable)._connection;
      (<any> connectable)._refCount = 0;
      (<any> connectable)._subject = null;
      (<any> connectable)._connection = null;
      if (connection) {
        connection.unsubscribe();
      }
    }
  }
}

class RefCountOperator<T> implements Operator<T, T> {
  constructor(private connectable: ConnectableObservable<T>) {
  }
  call(subscriber: ISubscriber<T>, source: any): TeardownLogic {

    const { connectable } = this;
    (<any> connectable)._refCount++;

    const refCounter = new RefCountSubscriber(subscriber, connectable);
    const subscription = source._subscribe(refCounter);

    if (!refCounter.closed) {
      (<any> refCounter).connection = connectable.connect();
    }

    return subscription;
  }
}

class RefCountSubscriber<T> extends Subscriber<T> {

  private connection: ISubscription;

  constructor(destination: ISubscriber<T>,
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

    ///
    // Compare the local RefCountSubscriber's connection Subscription to the
    // connection Subscription on the shared ConnectableObservable. In cases
    // where the ConnectableObservable source synchronously emits values, and
    // the RefCountSubscriber's dowstream Observers synchronously unsubscribe,
    // execution continues to here before the RefCountOperator has a chance to
    // supply the RefCountSubscriber with the shared connection Subscription.
    // For example:
    // ```
    // Observable.range(0, 10)
    //   .publish()
    //   .refCount()
    //   .take(5)
    //   .subscribe();
    // ```
    // In order to account for this case, RefCountSubscriber should only dispose
    // the ConnectableObservable's shared connection Subscription if the
    // connection Subscription exists, *and* either:
    //   a. RefCountSubscriber doesn't have a reference to the shared connection
    //      Subscription yet, or,
    //   b. RefCountSubscriber's connection Subscription reference is identical
    //      to the shared connection Subscription
    ///
    const { connection } = this;
    const sharedConnection = (<any> connectable)._connection;
    this.connection = null;

    if (sharedConnection && (!connection || sharedConnection === connection)) {
      sharedConnection.unsubscribe();
    }
  }
}
