import Observable from '../Observable';
import Scheduler from '../Scheduler';
import Observer from '../Observer';

class FromArrayObservable extends Observable {
  array:Array<any>;
  scheduler:Scheduler;
  
  constructor(array, scheduler) {
    super(null);
    this.array = array;
    this.scheduler = scheduler;
  }
  _subscribe(observer:Observer) {
    var array = this.array;
    var scheduler = this.scheduler;

    if (scheduler) {
      return scheduler.schedule(0, [{ done: false }, observer, array, -1], dispatch);
    }

    var index = -1;
    var count = array.length;

    while (++index < count) {
      var result = observer.next(array[index]);
      if (result.done) {
        return;
      }
    }

    observer["return"]();
  }
}

FromArrayObservable.prototype.constructor = Observable;

function dispatch(state) {
  var result = state[0];
  var observer = state[1];
  var array = state[2];
  var index = state[3];
  var total = array.length;
  if (++index < total) {
    result = observer.next(array[index]);
    if (!result.done) {
      state[0] = result;
      state[3] = index;
      this.reschedule(state);
    }
  } else if (!result.done) {
    observer["return"]();
  }
}

export default function fromArray(array:Array<Observable>, scheduler:Scheduler=null):Observable {
  return new FromArrayObservable(array, scheduler);
};
