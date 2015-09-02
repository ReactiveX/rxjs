import Scheduler from '../Scheduler';
import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Notification from '../Notification';

export class ObserveOnOperator<T, R> implements Operator<T, R> {

  delay: number;
  scheduler: Scheduler;

  constructor(scheduler: Scheduler, delay: number = 0) {
    this.delay = delay;
    this.scheduler = scheduler;
  }

  call(observer: Observer<T>): Observer<T> {
    return new ObserveOnSubscriber(observer, this.scheduler, this.delay);
  }
}

export class ObserveOnSubscriber<T> extends Subscriber<T> {

  static dispatch({ notification, destination }) {
    notification.observe(destination);
  }

  delay: number;
  scheduler: Scheduler;

  constructor(destination: Observer<T>, scheduler: Scheduler, delay: number = 0) {
    super(destination);
    this.delay = delay;
    this.scheduler = scheduler;
  }

  _next(x) {
    this.add(this.scheduler.schedule(this.delay,
      new ObserveOnMessage(Notification.createNext(x), this.destination),
      ObserveOnSubscriber.dispatch)
    );
  }

  _error(e) {
    this.add(this.scheduler.schedule(this.delay,
      new ObserveOnMessage(Notification.createError(e), this.destination),
      ObserveOnSubscriber.dispatch));
  }

  _complete() {
    this.add(this.scheduler.schedule(this.delay,
      new ObserveOnMessage(Notification.createComplete(), this.destination),
      ObserveOnSubscriber.dispatch));
  }
}

class ObserveOnMessage {
  notification: Notification<any>;
  destination: Observer<any>;
  
  constructor(notification: Notification<any>, destination:Observer<any>) {
    this.notification = notification;
    this.destination = destination;
  }
}