import {Subject} from '../Subject';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';

export class ConnectableObservable<T> extends Observable<T> {

  subject: Subject<T>;
  subscription: Subscription;

  constructor(public source: Observable<T>,
              protected subjectFactory: () => Subject<T>) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    return this._getSubject().subscribe(subscriber);
  }

  _getSubject() {
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
    subscription = source.subscribe(this._getSubject());
    subscription.add(new ConnectableSubscription(this));
    return (this.subscription = subscription);
  }

  refCount(): Observable<T> {
    return new RefCountObservable(this);
  }
}

class ConnectableSubscription extends Subscription {
  constructor(protected connectable: ConnectableObservable<any>) {
    super();
  }

  _unsubscribe() {
    const connectable = this.connectable;
    connectable.subject = null;
    connectable.subscription = null;
    this.connectable = null;
  }
}

class RefCountObservable<T> extends Observable<T> {
  connection: Subscription;

  constructor(protected connectable: ConnectableObservable<T>,
              public refCount: number = 0) {
    super();
  }

  _subscribe(subscriber: Subscriber<T>) {
    const connectable = this.connectable;
    const refCountSubscriber: RefCountSubscriber<T> = new RefCountSubscriber(subscriber, this);
    const subscription = connectable.subscribe(refCountSubscriber);
    if (!subscription.isUnsubscribed && ++this.refCount === 1) {
      refCountSubscriber.connection = this.connection = connectable.connect();
    }
    return subscription;
  }
}

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

  _resetConnectable() {
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

  _unsubscribe() {
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
