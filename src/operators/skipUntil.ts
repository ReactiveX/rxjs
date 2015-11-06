import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';

export function skipUntil<T>(notifier: Observable<any>): Observable<T> {
  return this.lift(new SkipUntilOperator(notifier));
}

class SkipUntilOperator<T, R> implements Operator<T, R> {
  constructor(private notifier: Observable<any>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new SkipUntilSubscriber(subscriber, this.notifier);
  }
}

class SkipUntilSubscriber<T> extends Subscriber<T> {
  private notificationSubscriber: NotificationSubscriber<any> = null;

  constructor(destination: Subscriber<T>,
              private notifier: Observable<any>) {
    super(destination);
    this.notificationSubscriber = new NotificationSubscriber(this);
    this.add(this.notifier.subscribe(this.notificationSubscriber));
  }

  _next(value: T) {
    if (this.notificationSubscriber.hasValue) {
      this.destination.next(value);
    }
  }

  _error(err: any) {
    this.destination.error(err);
  }

  _complete() {
    if (this.notificationSubscriber.hasCompleted) {
      this.destination.complete();
    }
    this.notificationSubscriber.unsubscribe();
  }

  unsubscribe() {
    if (this._isUnsubscribed) {
      return;
    } else if (this._subscription) {
      this._subscription.unsubscribe();
      this._isUnsubscribed = true;
    } else {
      super.unsubscribe();
    }
  }
}

class NotificationSubscriber<T> extends Subscriber<T> {
  hasValue: boolean = false;
  hasCompleted: boolean = false;

  constructor(private parent: SkipUntilSubscriber<any>) {
    super(null);
  }

  _next(unused: T) {
    this.hasValue = true;
  }

  _error(err) {
    this.parent.error(err);
    this.hasValue = true;
  }

  _complete() {
    this.hasCompleted = true;
  }
}
