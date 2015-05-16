/**
  Current frame scheduler. (aka Zalgo scheduler)
 */
var CurrentFrameScheduler = (function () {
    function CurrentFrameScheduler() {
        this._timeouts = [];
    }
    CurrentFrameScheduler.prototype.schedule = function (delay, state, work) {
        if (delay === 0) {
            // if no delay, do it now.
            // TODO: what to do with the return?
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
    CurrentFrameScheduler.prototype.dispose = function () {
        while (this._timeouts.length) {
            clearTimeout(this._timeouts.shift());
        }
    };
    return CurrentFrameScheduler;
})();
exports.default = CurrentFrameScheduler;
