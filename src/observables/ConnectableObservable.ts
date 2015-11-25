import {Subject} from '../Subject';
import {Observable} from '../Observable';
import {Subscription} from '../Subscription';
import {Subscriber} from '../Subscriber';

export class ConnectableObservable<T> extends Observable<T> {

  subject: Subject<T>;
  subscription: Subscription<T>;

  constructor(public source: Observable<T>,
              protected subjectFactory: () => Subject<T>) {
    super();
  }

  _subscribe(subscriber) {
    return this._getSubject().subscribe(subscriber);
  }

  _getSubject() {
    const subject = this.subject;
    if (subject && !subject.isUnsubscribed) {
      return subject;
    }
    return (this.subject = this.subjectFactory());
  }

  connect(): Subscription<T> {
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

class ConnectableSubscription<T> extends Subscription<T> {
  constructor(protected connectable: ConnectableObservable<T>) {
    super();
  }

  _unsubscribe() {
    const connectable = this.connectable;
    connectable.subject = void 0;
    connectable.subscription = void 0;
    this.connectable = void 0;
  }
}

class RefCountObservable<T> extends Observable<T> {
  connection: Subscription<T>;

  constructor(protected connectable: ConnectableObservable<T>,
              public refCount: number = 0) {
    super();
  }

  _subscribe(subscriber) {
    const connectable = this.connectable;
    const refCountSubscriber = new RefCountSubscriber(subscriber, this);
    const subscription = connectable.subscribe(refCountSubscriber);
    if (!subscription.isUnsubscribed && ++this.refCount === 1) {
      refCountSubscriber.connection = this.connection = connectable.connect();
    }
    return subscription;
  }
}

class RefCountSubscriber<T> extends Subscriber<T> {
  connection: Subscription<T>;

  constructor(public destination: Subscriber<T>,
              private refCountObservable: RefCountObservable<T>) {
    super(null);
    this.connection = refCountObservable.connection;
    destination.add(this);
  }

  _next(value: T) {
    this.destination.next(value);
  }

  _error(err: any) {
    this._resetConnectable();
    this.destination.error(err);
  }

  _complete() {
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
      observable.connection = void 0;
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
        observable.connection = void 0;
      }
    }
  }
}
