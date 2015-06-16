import Observable from '../Observable';
import Scheduler from '../Scheduler';

class EmptyObservable extends Observable {
  scheduler:Scheduler;
  
  constructor(scheduler:Scheduler=null) {
    super(null);
    this.scheduler = scheduler;
  }
  
  _subscribe(observer) {
    var scheduler = this.scheduler;
    if(scheduler) {
      return scheduler.schedule(0, observer, dispatch);
    }
    observer["return"]();
  }
}

EmptyObservable.prototype.constructor = Observable;

function dispatch(observer) {
  observer["return"]();
}

const staticEmpty = new EmptyObservable();

export default function empty(scheduler:Scheduler=null):Observable {
  return scheduler && new EmptyObservable(scheduler) || staticEmpty;
};
