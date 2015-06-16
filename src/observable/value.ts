import Observable from '../Observable';
import Scheduler from '../Scheduler';
import Observer from '../Observer';

class ValueObservable extends Observable {
  value:any;
  scheduler:Scheduler;
  
  constructor(value:any, scheduler:Scheduler) {
    super(null);
    this.value = value;
    this.scheduler = scheduler;  
  }
  
  subscriber(observer:Observer) {
    var value = this.value;
    var scheduler = this.scheduler;

    if(scheduler) {
        return scheduler.schedule(0, [observer, value], dispatch);
    }

    observer.next(value);
    observer.return();
  }
}

function dispatch([observer, value]) {
  observer.next(value);
  observer.return();
}

export default function value(value:any, scheduler:Scheduler=undefined) : Observable {
    return new ValueObservable(value, scheduler);
};
