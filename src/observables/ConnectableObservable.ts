import Subject from '../Subject';
import Scheduler from '../Scheduler';
import Observable from '../Observable';
import Subscription from '../Subscription';

export default class ConnectableObservable<T> extends Observable<T> {

  subject: Subject<T>;
  subscription: Subscription<T>;

  constructor(public    source: Observable<T>,
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

  connect() {
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
              public    refCount: number = 0) {
    super();
  }

  _subscribe(subscriber) {
    const connectable = this.connectable;
    const subscription = connectable.subscribe(subscriber);
    if (++this.refCount === 1) {
      this.connection = connectable.connect();
    }
    subscription.add(new RefCountSubscription(this));
    return subscription;
  }
}

class RefCountSubscription<T> extends Subscription<T> {

  constructor(private refCountObservable: RefCountObservable<T>) {
    super();
  }

  _unsubscribe() {
    const observable = this.refCountObservable;
    if (--observable.refCount === 0) {
      observable.connection.unsubscribe();
      observable.connection = void 0;
    }
  }
}
