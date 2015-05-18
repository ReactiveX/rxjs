import Scheduler from './scheduler';
export default class RequestAnimationFrameScheduler extends Scheduler {
    constructor() {
        super();
    }
    schedule(delay, state, work) {
        var argsLen = arguments.length;
        if (delay === 0) {
            requestAnimationFrame(() => {
                work(self, state);
            });
        }
        else if (delay > 0) {
            var self = this;
            var id = setTimeout(() => {
                requestAnimationFrame(() => {
                    work(self, state);
                });
            }, delay);
            this._timeouts.push(id);
        }
    }
    dispose() {
        while (this._timeouts.length) {
            clearTimeout(this._timeouts.shift());
        }
    }
}
//# sourceMappingURL=request-animation-frame-scheduler.js.map