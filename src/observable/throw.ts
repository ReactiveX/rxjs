import Observable from '../Observable';
import Scheduler from '../Scheduler';

class ThrowObservable extends Observable {
  scheduler:Scheduler;
  err:any;
  
  constructor(err:any, scheduler:Scheduler=null) {
    super(null);
    this.err = err;
    this.scheduler = scheduler;
  }
  
  _subscribe(observer) {
    var scheduler = this.scheduler;
    var err = this.err;
    if(scheduler) {
      return scheduler.schedule(0, { observer, err }, dispatch);
    }
    observer["throw"](err);
  }
}

ThrowObservable.prototype.constructor = Observable;

function dispatch({ observer, err }) {
  observer["throw"](err);
}

export default function _throw(err:any=undefined, scheduler:Scheduler=null):Observable {
  return new ThrowObservable(err, scheduler);
};
