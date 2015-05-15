/**
  Current frame scheduler. (aka Zalgo scheduler)
 */
export default class CurrentFrameScheduler {
    constructor() {
        this._timeouts = [];
    }
    schedule(delay, state, work) {
        var argsLen = arguments.length;
        if (argsLen === 2) {
            work = state;
            state = delay;
            delay = 0;
        }
        else if (argsLen === 1) {
            work = delay;
            state = undefined;
            delay = 0;
        }
        if (delay === 0) {
            // if no delay, do it now.
            // TODO: what to do with the return?
            work(this, state);
        }
        else if (delay > 0) {
            var self = this;
            var id = setTimeout(() => {
                work(self, state);
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
//# sourceMappingURL=current-frame-scheduler.js.map