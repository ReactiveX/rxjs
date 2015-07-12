import Observable from '../Observable';
import Observer from '../Observer';
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
  
  subscriber(observer:Observer) {
    this.scheduler.schedule(this.interval, new IntervalObserver(observer, this.interval, this.scheduler), dispatch);
  }
}

class IntervalObserver extends Observer {
  interval:number;
  scheduler:Scheduler;
  counter:number = 0;
  
  constructor(destination:Observer, interval:number, scheduler:Scheduler) {
    super(destination);
    this.interval = interval;
    this.scheduler = scheduler;
  }
  
  emitNext() {
    if(!this.unsubscribed) {
      this.next(this.counter++);
      this.scheduler.schedule(this.interval, this, dispatch);
    }
  }
}

function dispatch(observer:IntervalObserver) {
  observer.emitNext();
}

export default function timer(interval:number=0, scheduler:Scheduler=nextTick):Observable {
  return new IntervalObservable(interval, scheduler);
};
