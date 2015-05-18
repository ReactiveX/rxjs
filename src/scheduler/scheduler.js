/**
  Current frame scheduler. (aka Zalgo scheduler)
 */
export default class Scheduler {
    constructor() {
        this._timeouts = [];
    }
    now(state, work) {
        this.schedule(0, state, work);
    }
    schedule(delay, state, work) {
        if (delay === 0) {
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
//# sourceMappingURL=scheduler.js.map