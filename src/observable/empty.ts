import Observable from '../Observable';
import Scheduler from '../Scheduler';

class EmptyObservable extends Observable {
  scheduler:Scheduler;
  
  constructor(scheduler:Scheduler) {
    super(null);
    this.scheduler = scheduler;
  }
  
  subscriber(observer) {
    var scheduler = this.scheduler;
    if(scheduler) {
        return scheduler.schedule(0, observer, dispatch);
    }
    observer["return"]();
  }
}

function dispatch(observer) {
    observer["return"]();
}

const staticEmpty = new EmptyObservable(Scheduler.immediate);

export default function empty(scheduler:Scheduler=Scheduler.immediate):Observable {
    return scheduler && new EmptyObservable(scheduler) || staticEmpty;
};
