import Observable from '../Observable';
import Subscriber from '../Subscriber';
import Scheduler from '../scheduler/Scheduler';
import nextTick from '../scheduler/nextTick';

class TimerObservable extends Observable {
  delay:number;
  scheduler:Scheduler;
  
  constructor(delay:number, scheduler:Scheduler) {
    super(null);
    this.delay = delay;
    this.scheduler = scheduler;
  }
  
  subscriber(subscriber:Subscriber) {
    return this.scheduler.schedule(this.delay, subscriber, dispatch);
  }
}

function dispatch(subscriber:Subscriber) {
  if(!subscriber.isUnsubscribed) {
    subscriber.next(0);
    subscriber.complete();
  }
}

export default function timer(delay:number=0, scheduler:Scheduler=nextTick):Observable {
  return new TimerObservable(delay, scheduler);
};
