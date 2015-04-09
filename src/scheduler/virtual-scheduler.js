/**
  A scheduler that might be used for deterministic tests.
  @class VirtualScheduler
*/
export default class VirtualScheduler {
  constructor() {
    this._queue = [];
    this._index = 0;
  }

  /**
    Schedules a task, but tasks are not run until `flush` is called.
  */
  schedule(delay, state, work) {
    var argsLen = arguments.length;

    if(argsLen === 2) {
      work = state;
      state = delay;
      delay = 0;
    }
    else if(argsLen === 1) {
      work = delay;
      state = undefined;
      delay = 0;
    }
    
    var index = this._index++;

    this._queue.push({ delay, state, work, index });
  }

  /**
    executes all tasks queued in the virtual scheduler to the specified delay.
    specified delay. If the
    @method flush
    @param toDelay {Number} [optional] delay in millisecods, if not passed or falsy,
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

    if(queue.length === 0) {
      this._index = 0;
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

