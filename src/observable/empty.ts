import OperatorObservable from '../OperatorObservable';
import Scheduler from '../Scheduler';

class EmptyObservable extends OperatorObservable {
  scheduler:Scheduler;
  
  constructor(scheduler:Scheduler) {
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

function dispatch(observer) {
    observer["return"]();
}

const staticEmpty = new EmptyObservable(Scheduler.immediate);

export default function empty(scheduler:Scheduler=Scheduler.immediate):OperatorObservable {
    return scheduler && new EmptyObservable(scheduler) || staticEmpty;
};
