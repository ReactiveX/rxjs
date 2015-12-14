import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';

export function inspect<T>(notifier: Observable<any>): Observable<T> {
  return this.lift(new InspectOperator(notifier));
}

class InspectOperator<T, R> implements Operator<T, R> {
  constructor(private notifier: Observable<any>) {
  }

  call(subscriber: Subscriber<R>) {
    return new InspectSubscriber(subscriber, this.notifier);
  }
}

class InspectSubscriber<T> extends Subscriber<T> {
  private lastValue: T;
  private hasValue: boolean = false;

  constructor(destination: Subscriber<T>, private notifier: Observable<any>) {
    super(destination);
    this.add(notifier._subscribe(new SampleNotificationSubscriber(this)));
  }

  _next(value: T) {
    this.lastValue = value;
    this.hasValue = true;
  }

  notifyNext() {
    if (this.hasValue) {
      this.destination.next(this.lastValue);
    }
  }
}

class SampleNotificationSubscriber<T> extends Subscriber<T> {
  constructor(private parent: InspectSubscriber<T>) {
    super(null);
  }

  _next() {
    this.parent.notifyNext();
  }

  _error(err: any) {
    this.parent.error(err);
  }

  _complete() {
    //noop
  }
}
