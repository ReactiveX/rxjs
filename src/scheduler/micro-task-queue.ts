import getBoundNext from '../util/get-bound-next';

/** 
  A micro task queue specialized for scheduler use.
  @class MicroTaskQueue
*/
export default class MicroTaskQueue {
  /**
    @contructor
    @param gap {Number} the number of ms before a new frame is queued for task processing.
      if the gap is 0, it will run all tasks in a single frame. (Defaults to 0)
  */
  constructor(gap) {
    this._queue = [];
    this._gap = gap || 0;
    this.isProcessing = false;
    this.isDisposed = false;
    this._flushNext = getBoundNext(this.flush.bind(this));
  }

  /**
    Enqueues a task to be run based on the state, work and scheduler passed
    @method enqueue
    @param state {Object} the state to run the work against.
    @param work {Function} the work to be done
    @param scheduler {Scheduler} the scheduler the work is being done for.
    @return {MicroTask} a micro task which is disposable.
  */
  enqueue(state, work, scheduler) {
    var task = new MicroTask(this, state, work, scheduler);
    this._queue.push(task);
    this.scheduleFlush();
    return task;
  }

  /**
    Removes a micro task from the queue
    @method dequeue
    @param task {MicroTask} the task to dequeue
  */
  dequeue(task) {
    this._queue.splice(this._queue.indexOf(task), 1);
  }

  /**
    Clears the queue and prevents any delayed execution of tasks.
    @method dispose
  */
  dispose() {
    this._queue.length = 0;
    this.isProcessing = false;
    this.isDisposed = true;
  }

  /**
    Schedules a flush to be called as a micro task if possible. Otherwise as a setTimeout.
    See `utils/get-bound-next'
    @method scheduleFlush
  */
  scheduleFlush() {
    if(!this.isProcessing) {
      this.isProcessing = true;
      this._flushNext();
    }
  }

  /**
    Processes the queue of tasks.
    @method flush
  */
  flush() {
    var start = Date.now();
    while(this._queue.length > 0) {
      var task = this._queue.shift();
      task.work(task.scheduler, task.state);
      if(this._gap > 0 && Date.now() - start > this._gap) {
        break;
      }
    }

    if(this._queue.length > 0) {
      this._flushNext();
    }
    else {
      this.isProcessing = false;
    }
  }
}

/**
  A structure for defining a task on a MicroTaskQueue
  @class MicroTask
*/
class MicroTask {
  constructor(queue, state, work, scheduler) {
    this.queue = queue;
    this.state = state;
    this.work = work;
    this.scheduler = scheduler;
  }

  /**
    dequeues the task from it's queue
    @method dispose
  */
  dispose() {
    this.queue.dequeue(this);
  }
}

