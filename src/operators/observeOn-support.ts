import {Scheduler} from '../Scheduler';
import {Operator} from '../Operator';
import {Observer} from '../Observer';
import {Subscriber} from '../Subscriber';
import {Notification} from '../Notification';

export class ObserveOnOperator<T, R> implements Operator<T, R> {
  constructor(private scheduler: Scheduler, private delay: number = 0) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new ObserveOnSubscriber(subscriber, this.scheduler, this.delay);
  }
}

export class ObserveOnSubscriber<T> extends Subscriber<T> {
  static dispatch({ notification, destination }) {
    notification.observe(destination);
  }

  constructor(destination: Subscriber<T>,
              private scheduler: Scheduler,
              private delay: number = 0) {
    super(destination);
  }

  private scheduleMessage(notification: Notification<any>): void {
     this.add(this.scheduler.schedule(ObserveOnSubscriber.dispatch,
                                      this.delay,
                                      new ObserveOnMessage(notification, this.destination)));
   }

  _next(value: T): void {
    this.scheduleMessage(Notification.createNext(value));
  }

  _error(err: any): void {
    this.scheduleMessage(Notification.createError(err));
  }

  _complete(): void {
    this.scheduleMessage(Notification.createComplete());
  }
}

class ObserveOnMessage {
  constructor(public notification: Notification<any>,
              public destination: Observer<any>) {
  }
}