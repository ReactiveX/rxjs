import Observable from '../Observable';
import Subscriber from '../Subscriber';
import Scheduler from '../scheduler/Scheduler';
import nextTick from '../scheduler/nextTick';

class IntervalObservable extends Observable {
  interval:number;
  scheduler:Scheduler;
  
  constructor(interval:number, scheduler:Scheduler) {
    super(null);
    this.interval = interval;
    this.scheduler = scheduler;
  }
  
  subscriber(observer:Subscriber) {
    this.scheduler.schedule(this.interval, new IntervalSubscriber(observer, this.interval, this.scheduler), dispatch);
  }
}

class IntervalSubscriber extends Subscriber {
  interval:number;
  scheduler:Scheduler;
  counter:number = 0;
  
  constructor(destination:Subscriber, interval:number, scheduler:Scheduler) {
    super(destination);
    this.interval = interval;
    this.scheduler = scheduler;
  }
  
  emitNext() {
    if(!this.isUnsubscribed) {
      this.next(this.counter++);
      this.scheduler.schedule(this.interval, this, dispatch);
    }
  }
}

function dispatch(observer:IntervalSubscriber) {
  observer.emitNext();
}

export default function timer(interval:number=0, scheduler:Scheduler=nextTick):Observable {
  return new IntervalObservable(interval, scheduler);
};
