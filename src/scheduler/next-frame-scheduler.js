import Scheduler from './scheduler';
import MicroTaskQueue from './micro-task-queue';
export default class NextFrameScheduler extends Scheduler {
    constructor() {
        super();
        this._queue = new MicroTaskQueue();
    }
    schedule(delay, state, work) {
        if (delay === 0) {
            this._queue.enqueue(state, work, this);
        }
        else if (delay > 0) {
            var self = this;
            var id = window.setTimeout(() => {
                work(self, state);
            }, delay);
            this._timeouts.push(id);
        }
    }
    dispose() {
        if (this._queue) {
            this._queue.dispose();
        }
        while (this._timeouts.length) {
            window.clearTimeout(this._timeouts.shift());
        }
    }
}
//# sourceMappingURL=next-frame-scheduler.js.map