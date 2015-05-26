/**
  Current frame scheduler. (aka Zalgo scheduler)
 */
var Scheduler = (function () {
    function Scheduler() {
        this._timeouts = [];
    }
    Scheduler.prototype.now = function (state, work) {
        this.schedule(0, state, work);
    };
    Scheduler.prototype.schedule = function (delay, state, work) {
        if (delay === 0) {
            work(this, state);
        }
        else if (delay > 0) {
            var self = this;
            var id = setTimeout(function () {
                work(self, state);
            }, delay);
            this._timeouts.push(id);
        }
    };
    Scheduler.prototype.dispose = function () {
        while (this._timeouts.length) {
            clearTimeout(this._timeouts.shift());
        }
    };
    return Scheduler;
})();
exports["default"] = Scheduler;
