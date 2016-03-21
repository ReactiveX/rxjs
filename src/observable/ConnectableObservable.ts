import {Subject} from '../Subject';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';

/**
 * @class ConnectableObservable<T>
 */
export class ConnectableObservable<T> extends Observable<T> {

  protected subject: Subject<T>;
  protected subscription: Subscription;

  constructor(protected source: Observable<T>,
              protected subjectFactory: () => Subject<T>) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    return this.getSubject().subscribe(subscriber);
  }

  protected getSubject() {
    const subject = this.subject;
    if (subject && !subject.isUnsubscribed) {
      return subject;
    }
    return (this.subject = this.subjectFactory());
  }

  connect(): Subscription {
    const source = this.source;
    let subscription = this.subscription;
    if (subscription && !subscription.isUnsubscribed) {
      return subscription;
    }
    subscription = source.subscribe(this.getSubject());
    subscription.add(new ConnectableSubscription(this));
    return (this.subscription = subscription);
  }

  refCount(): Observable<T> {
    return new RefCountObservable(this);
  }

  /**
   * This method is opened for `ConnectableSubscription`.
   * Not to call from others.
   */
  _closeSubscription(): void {
    this.subject = null;
    this.subscription = null;
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class ConnectableSubscription extends Subscription {
  constructor(protected connectable: ConnectableObservable<any>) {
    super();
  }

  protected _unsubscribe() {
    const connectable = this.connectable;
    connectable._closeSubscription();
    this.connectable = null;
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class RefCountObservable<T> extends Observable<T> {
  connection: Subscription;

  constructor(protected connectable: ConnectableObservable<T>,
              public refCount: number = 0) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    const connectable = this.connectable;
    const refCountSubscriber: RefCountSubscriber<T> = new RefCountSubscriber(subscriber, this);
    const subscription = connectable.subscribe(refCountSubscriber);
    if (!subscription.isUnsubscribed && ++this.refCount === 1) {
      refCountSubscriber.connection = this.connection = connectable.connect();
    }
    return subscription;
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class RefCountSubscriber<T> extends Subscriber<T> {
  connection: Subscription;

  constructor(public destination: Subscriber<T>,
              private refCountObservable: RefCountObservable<T>) {
    super(null);
    this.connection = refCountObservable.connection;
    destination.add(this);
  }

  protected _next(value: T) {
    this.destination.next(value);
  }

  protected _error(err: any) {
    this._resetConnectable();
    this.destination.error(err);
  }

  protected _complete() {
    this._resetConnectable();
    this.destination.complete();
  }

  private _resetConnectable() {
    const observable = this.refCountObservable;
    const obsConnection = observable.connection;
    const subConnection = this.connection;
    if (subConnection && subConnection === obsConnection) {
      observable.refCount = 0;
      obsConnection.unsubscribe();
      observable.connection = null;
      this.unsubscribe();
    }
  }

  protected _unsubscribe() {
    const observable = this.refCountObservable;
    if (observable.refCount === 0) {
      return;
    }
    if (--observable.refCount === 0) {
      const obsConnection = observable.connection;
      const subConnection = this.connection;
      if (subConnection && subConnection === obsConnection) {
        obsConnection.unsubscribe();
        observable.connection = null;
      }
    }
  }
}
