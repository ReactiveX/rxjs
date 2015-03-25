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
		executes all tasks queued in the virtual scheduler
		@method flush
	*/
	flush() {
		var self = this;
		this._queue.sort(taskSort).
			forEach((task) => task.work(self, state));
		this._queue.length = 0;
		this._index = 0;
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

