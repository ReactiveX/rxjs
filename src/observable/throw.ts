import Observable from '../Observable';
import Scheduler from '../Scheduler';

class ThrowObservable extends Observable {
  scheduler:Scheduler;
  err:any;
  
  constructor(err:any, scheduler:Scheduler) {
    super(null);
    this.err = err;
    this.scheduler = scheduler;
  }
  
  subscriber(observer) {
    var scheduler = this.scheduler;
    var err = this.err;
    if(scheduler) {
        return scheduler.schedule(0, { observer, err }, dispatch);
    }
    observer["throw"](this.err);
  }
}

function dispatch({ observer, err }) {
    observer["throw"](err);
}

var staticEmpty = new ThrowObservable(undefined, undefined);

export default function _throw(err:any=undefined, scheduler:Scheduler=Scheduler.immediate):Observable {
    return new ThrowObservable(err, scheduler);
};
