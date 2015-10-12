import Subscription from '../Subscription';
import Subject from '../Subject';
import Subscriber from '../Subscriber';
import Observable from '../Observable';

export class RefCountSubscription<T> extends Subscription<T> {
  primary: Subscription<T>;
  attemptedToUnsubscribePrimary: boolean = false;
  count: number = 0;

  constructor() {
    super();
  }

  setPrimary(subscription: Subscription<T>) {
    this.primary = subscription;
  }

  unsubscribe() {
    if (!this.isUnsubscribed && !this.attemptedToUnsubscribePrimary) {
      this.attemptedToUnsubscribePrimary = true;
      if (this.count === 0) {
        super.unsubscribe();
        this.primary.unsubscribe();
      }
    }
  }
}

export class GroupedObservable<T> extends Observable<T> {
  constructor(public key: string,
              private groupSubject: Subject<T>,
              private refCountSubscription?: RefCountSubscription<T>) {
    super();
  }

  _subscribe(subscriber: Subscriber<T>) {
    const subscription = new Subscription();
    if (this.refCountSubscription && !this.refCountSubscription.isUnsubscribed) {
      subscription.add(new InnerRefCountSubscription(this.refCountSubscription));
    }
    subscription.add(this.groupSubject.subscribe(subscriber));
    return subscription;
  }
}

export class InnerRefCountSubscription<T> extends Subscription<T> {
  constructor(private parent: RefCountSubscription<T>) {
    super();
    parent.count++;
  }

  unsubscribe() {
    if (!this.parent.isUnsubscribed && !this.isUnsubscribed) {
      super.unsubscribe();
      this.parent.count--;
      if (this.parent.count === 0 && this.parent.attemptedToUnsubscribePrimary) {
        this.parent.unsubscribe();
        this.parent.primary.unsubscribe();
      }
    }
  }
}

