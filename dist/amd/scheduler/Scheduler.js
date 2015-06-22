define(['exports', 'module', './SchedulerActions'], function (exports, module, _SchedulerActions) {
    'use strict';

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var Scheduler = (function () {
        function Scheduler() {
            _classCallCheck(this, Scheduler);

            this.actions = [];
            this.active = false;
            this.scheduled = false;
        }

        Scheduler.prototype.schedule = function schedule(delay, state, work) {
            if (delay <= 0) {
                return this.scheduleNow(state, work);
            } else {
                return this.scheduleLater(state, work, delay);
            }
        };

        Scheduler.prototype.flush = function flush() {
            if (!this.active) {
                this.active = true;
                var action;
                while (action = this.actions.shift()) {
                    action.execute();
                }
                ;
                this.active = false;
            }
        };

        Scheduler.prototype.scheduleNow = function scheduleNow(state, work) {
            return new _SchedulerActions.ScheduledAction(this, state, work);
        };

        Scheduler.prototype.scheduleLater = function scheduleLater(state, work, delay) {
            return new _SchedulerActions.FutureScheduledAction(this, state, work, delay);
        };

        return Scheduler;
    })();

    module.exports = Scheduler;
});