import Scheduler from './scheduler';

/**
  A scheduler that might be used for deterministic tests.
  @class VirtualScheduler
*/
export default class VirtualScheduler extends Scheduler {
  private _queue : Array<Task>

  constructor() {
    super();
    this._queue = [];
  }

  now(state:any, work:Function) {
    this.schedule(0, state, work);
  }

  /**
    Schedules a task, but tasks are not run until `flush` is called.
  */
  schedule(delay:Number, state:any, work:Function) {
    var task = new Task(delay, state, work, this);
    this._queue.push(task);
  }

  /**
    executes all tasks queued in the virtual scheduler to the specified delay.
    specified delay. If the
    @method flush
    @param toDelay {Number} [optional] delay in milliseconds, if not passed or falsy,
      will flush all tasks in queue.
  */
  flush(toDelay) {
    var queue = this._queue;
    queue.sort(taskSort);
    var i, task, len;
    for(i = 0, len = queue.length; i < len; i++) {
      task = queue[i];
      if(toDelay && task.delay > toDelay) {
        break;
      }
      task.work(this, task.state);
    }
  }

  dispose() {
    this._queue = null;
  }
}

function taskSort(a, b) {
  return a.delay === b.delay ?
    (a.index > b.index ? 1 : -1) : 
    (a.delay > b.delay ? 1 : -1);
}

export class Task {
  constructor(public delay:Number, public state:any, public work:Function, scheduler:Scheduler) {
  }
}