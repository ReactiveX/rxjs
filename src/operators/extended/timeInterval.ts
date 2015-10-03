import Operator from '../../Operator';
import Observer from '../../Observer';
import Observable from '../../Observable';
import Subscriber from '../../Subscriber';
import Scheduler from '../../Scheduler';
import immediate from '../../schedulers/immediate';

export default function timeInterval<T>(scheduler: Scheduler = immediate): Observable<TimeInterval> {
  return this.lift(new TimeIntervalOperator(scheduler));
}

export class TimeInterval {
  constructor(public value: any, public interval: number) {

  }
};

class TimeIntervalOperator<TimeInterval, R> implements Operator<TimeInterval, R> {
  constructor(private scheduler: Scheduler) {

  }

  call(observer: Subscriber<TimeInterval>): Subscriber<TimeInterval> {
    return new TimeIntervalSubscriber(observer, this.scheduler);
  }
}

class TimeIntervalSubscriber<TimeInterval> extends Subscriber<TimeInterval> {
  private lastTime: number = 0;

  constructor(destination: Subscriber<TimeInterval>, private scheduler: Scheduler) {
    super(destination);

    this.lastTime = scheduler.now();
  }

  _next(value: TimeInterval) {
    let now = this.scheduler.now();
    let span = now - this.lastTime;
    this.lastTime = now;

    this.destination.next(new TimeInterval(value, span));
  }
}