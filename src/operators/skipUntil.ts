import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';

export default function skipUntil(total) {
  return this.lift(new SkipUntilOperator(total));
}

export class SkipUntilOperator<T, R> implements Operator<T, R> {
  constructor(private notifier: Observable<any>) {
  }

  call(observer: Observer<R>): Observer<T> {
    return new SkipUntilSubscriber(observer, this.notifier);
  }
}

export class SkipUntilSubscriber<T> extends Subscriber<T> {
  private notificationSubscriber: NotificationSubscriber<any> = new NotificationSubscriber();

  constructor(destination: Observer<T>, private notifier: Observable<any>) {
    super(destination);
    this.add(this.notifier.subscribe(this.notificationSubscriber))
  }

  _next(x) {
    if (this.notificationSubscriber.hasNotified) {
      this.destination.next(x);
    }
  }
}

export class NotificationSubscriber<T> extends Subscriber<T> {
  hasNotified: boolean = false;

  constructor() {
    super(null);
  }

  _next() {
    this.hasNotified = true;
    this.unsubscribe();
  }
}
