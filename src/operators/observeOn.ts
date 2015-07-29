import Operator from '../Operator';
import Observer from '../Observer';
import Scheduler from '../Scheduler';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

export default function observeOn<T>(scheduler: Scheduler, delay: number = 0): Observable<T> {
  return this.lift(new ObserveOnOperator(scheduler, delay));
}

export class ObserveOnOperator<T, R> extends Operator<T, R> {

  delay: number;
  scheduler: Scheduler;

  constructor(scheduler: Scheduler, delay: number = 0) {
    super();
    this.delay = delay;
    this.scheduler = scheduler;
  }

  call(observer: Observer<T>): Observer<T> {
    return new ObserveOnSubscriber(observer, this.scheduler, this.delay);
  }
}

export class ObserveOnSubscriber<T> extends Subscriber<T> {

  static dispatch({ type, value, destination }) {
    destination[type](value);
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

  type: string;
  value: any;
  destination: Observer<any>;

  constructor(type: string, value: any, destination: Observer<any>) {
    this.type = type;
    this.value = value;
    this.destination = destination;
  }
}