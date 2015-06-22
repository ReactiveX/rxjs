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
            return delay <= 0 ? this.scheduleNow(state, work) : this.scheduleLater(state, work, delay);
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
            var action = new _SchedulerActions.ScheduledAction(this, state, work);
            action.schedule();
            return action;
        };

        Scheduler.prototype.scheduleLater = function scheduleLater(state, work, delay) {
            var action = new _SchedulerActions.FutureScheduledAction(this, state, work, delay);
            action.schedule();
            return action;
        };

        return Scheduler;
    })();

    module.exports = Scheduler;
});