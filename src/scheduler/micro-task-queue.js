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
		this.run();
		return task;
	}

	/**
		Removes a micro task from the queue
		@method dequeue
		@param task {MicroTask} the task to dequeue
	*/
	dequeue(task) {
		var i, t;
		for(i = this._queue.length; i--;) {
			t = this._queue[i];
			if(t === task) {
				this._queue.splice(i, 1);
				break;
			}
		}
	}

	/**
		Clears the queue and prevents any delayed execution of tasks.
		@method dispose
	*/
	dispose() {
		if(this.isProcessing) {
			clearImmediate(this._immediate);
		}
		this._queue.length = 0;
	}

	/**
		Starts processing the queue of tasks. (Called automatically by `enqueue`)
		@method run
	*/
	run() {
		if(!this.isProcessing) {
			if(this._gap === 0) {
				var i;
				for(i = this._queue.length - 1; i <= 0; i--) {
					var task = this._queue[i];
					runTask(task);
				}
				this._queue.length = 0;
			}
			else if(this._gap > 0) {
				processQueue(this._queue, this._gap, this);
			}
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
		this.scheduler = scheduler
	}

	/**
		dequeues the task from it's queue
		@method dispose
	*/
	dispose() {
		this.queue.dequeue(this);
	}
}

function processQueue(queue, gap, state) {
	state.isProcessing = true;
	var start = Date.now();
	var task;
	while(queue.length > 0) {
		task = queue.shift();
		runTask(task);
		if(Date.now() - start > gap) {
			break;
		}
	}
	if(queue.length > 0) {
		state._immediate = setImmediate(() => {
			processQueue(queue, gap, state);
		});
	} else {
		state.isProcessing = false;
		state._immediate = null;
	}
}

function runTask(task) {
	return task.work(task.scheduler, task.state);
}