import MicroTaskQueue from './micro-task-queue';

//TODO: sniff for nextTick or setImmediate

export default class NextFrameScheduler {
  constructor(taskQueueGap) {
    this._timeouts = [];
    this._queue = new MicroTaskQueue(taskQueueGap || 0);
  }

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

    if(delay === 0) {
      this._queue.enqueue(state, work, this);
    }
    else if(delay > 0) {
      var self = this;
      // TODO: will this be more performant if it's using a MicroTaskQueue for each delay (cleared after frame end)?
      var id = window.setTimeout(() => {
        work(self, state);
      }, delay);
      this._timeouts.push(id);
    }
  }

  dispose() {
    if(this._queue) {
      this._queue.dispose();
    }

    while(this._timeouts.length) {
      window.clearTimeout(this._timeouts.shift());
    }
  }
}


