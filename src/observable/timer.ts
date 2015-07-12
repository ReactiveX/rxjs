import Observable from '../Observable';
import Observer from '../Observer';
import Scheduler from '../scheduler/Scheduler';
import nextTick from '../scheduler/nextTick';
import $$observer from '../util/Symbol_observer';

class TimerObservable extends Observable {
  delay:number;
  scheduler:Scheduler;
  
  constructor(delay:number, scheduler:Scheduler) {
    super(null);
    this.delay = delay;
    this.scheduler = scheduler;
  }
  
  [$$observer](observer:Observer) {
    this.scheduler.schedule(this.delay, observer, dispatch);
  }
}

function dispatch(observer:Observer) {
  if(!observer.unsubscribed) {
    observer.next(0);
    observer.complete();
  }
}

export default function timer(delay:number=0, scheduler:Scheduler=nextTick):Observable {
  return new TimerObservable(delay, scheduler);
};
