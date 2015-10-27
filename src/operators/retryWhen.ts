import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Observable from '../Observable';
import Subject from '../Subject';
import Subscription from '../Subscription';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export default function retryWhen<T>(notifier: (errors: Observable<any>) => Observable<any>) {
  return this.lift(new RetryWhenOperator(notifier, this));
}

class RetryWhenOperator<T, R> implements Operator<T, R> {
  constructor(protected notifier: (errors: Observable<any>) => Observable<any>,
              protected source: Observable<T>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new FirstRetryWhenSubscriber<T>(subscriber, this.notifier, this.source);
  }
}

class FirstRetryWhenSubscriber<T> extends Subscriber<T> {
  lastSubscription: Subscription<T>;
  notificationSubscription: Subscription<T>;
  errors: Subject<any>;
  retryNotifications: Observable<any>;

  constructor(public destination: Subscriber<T>,
              public notifier: (errors: Observable<any>) => Observable<any>,
              public source: Observable<T>) {
    super(null);
    this.lastSubscription = this;
  }

  _next(value: T) {
    this.destination.next(value);
  }

  error(err?) {
    if (!this.isUnsubscribed) {
      super.unsubscribe();
      if (!this.retryNotifications) {
        this.errors = new Subject();
        const notifications = tryCatch(this.notifier).call(this, this.errors);
        if (notifications === errorObject) {
          this.destination.error(errorObject.e);
        } else {
          this.retryNotifications = notifications;
          const notificationSubscriber = new RetryNotificationSubscriber(this);
          this.notificationSubscription = notifications.subscribe(notificationSubscriber);
        }
      }
      this.errors.next(err);
    }
  }

  destinationError(err: any) {
    this.tearDown();
    this.destination.error(err);
  }

  _complete() {
    this.destinationComplete();
  }

  destinationComplete() {
    this.tearDown();
    this.destination.complete();
  }

  unsubscribe() {
    const lastSubscription = this.lastSubscription;
    if (lastSubscription === this) {
      super.unsubscribe();
    } else {
      this.tearDown();
    }
  }

  tearDown() {
    super.unsubscribe();
    this.lastSubscription.unsubscribe();
    const notificationSubscription = this.notificationSubscription;
    if (notificationSubscription) {
      notificationSubscription.unsubscribe();
    }
  }

  resubscribe() {
    this.lastSubscription.unsubscribe();
    const nextSubscriber = new MoreRetryWhenSubscriber(this);
    this.lastSubscription = this.source.subscribe(nextSubscriber);
  }
}

class MoreRetryWhenSubscriber<T> extends Subscriber<T> {
  constructor(private parent: FirstRetryWhenSubscriber<T>) {
    super(null);
  }

  _next(value: T) {
    this.parent.destination.next(value);
  }

  _error(err: any) {
    this.parent.errors.next(err);
  }

  _complete() {
    this.parent.destinationComplete();
  }
}

class RetryNotificationSubscriber<T> extends Subscriber<T> {
  constructor(public parent: FirstRetryWhenSubscriber<any>) {
    super(null);
  }

  _next(value: T) {
    this.parent.resubscribe();
  }

  _error(err: any) {
    this.parent.destinationError(err);
  }

  _complete() {
    this.parent.destinationComplete();
  }
}