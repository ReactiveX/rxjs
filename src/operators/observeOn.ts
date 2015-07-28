import Operator from '../Operator';
import Observer from '../Observer';
import Scheduler from '../Scheduler';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

export default function observeOn<T>(scheduler: Scheduler, delay: number = 0): Observable<T> {
  return this.lift(new ObserveOnOperator(scheduler, delay));
}

export class ObserveOnOperator<T, R> extends Operator<T, R> {

  constructor(protected scheduler: Scheduler, protected delay: number = 0) {
    super();
  }

  call(observer: Observer<T>): Observer<T> {
    return new ObserveOnSubscriber(observer, this.scheduler, this.delay);
  }
}

export class ObserveOnSubscriber<T> extends Subscriber<T> {

  static dispatch({ type, value, destination }) {
    destination[type](value);
  }

  constructor(public    destination: Observer<T>,
              protected scheduler: Scheduler,
              protected delay: number = 0) {
    super(destination);
  }

  _next(x) {
    this.add(this.scheduler.schedule(this.delay,
      new ScheduledNotification("next", x, this.destination),
      ObserveOnSubscriber.dispatch)
    );
  }

  _error(e) {
    this.add(this.scheduler.schedule(this.delay, 
      new ScheduledNotification("error", e, this.destination),
      ObserveOnSubscriber.dispatch));
  }

  _complete() {
    this.add(this.scheduler.schedule(this.delay, 
      new ScheduledNotification("complete", void 0, this.destination),
      ObserveOnSubscriber.dispatch));
  }
}

class ScheduledNotification {
  constructor(public type: string,
              public value: any,
              public destination: Observer<any>) {
  }
}