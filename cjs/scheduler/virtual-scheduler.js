"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
  A scheduler that might be used for deterministic tests.
  @class VirtualScheduler
*/

var VirtualScheduler = (function () {
    function VirtualScheduler() {
        _classCallCheck(this, VirtualScheduler);

        this._queue = [];
    }

    _createClass(VirtualScheduler, [{
        key: "now",
        value: function now(state, work) {
            return this.schedule(0, state, work);
        }
    }, {
        key: "schedule",

        /**
          Schedules a task, but tasks are not run until `flush` is called.
        */
        value: function schedule(delay, state, work) {
            var task = new Task(delay, state, work, this);
            this._queue.push(task);
            return task;
        }
    }, {
        key: "flush",

        /**
          executes all tasks queued in the virtual scheduler to the specified delay.
          specified delay. If the
          @method flush
          @param toDelay {Number} [optional] delay in milliseconds, if not passed or falsy,
            will flush all tasks in queue.
        */
        value: function flush(toDelay) {
            var queue = this._queue;
            queue.sort(taskSort);
            var i, task, len;
            for (i = 0, len = queue.length; i < len; i++) {
                task = queue[i];
                if (toDelay && task.delay > toDelay) {
                    break;
                }
                task.work(this, task.state);
            }
        }
    }, {
        key: "dispose",
        value: function dispose() {
            this._queue = null;
        }
    }]);

    return VirtualScheduler;
})();

exports["default"] = VirtualScheduler;

function taskSort(a, b) {
    return a.delay === b.delay ? a.index > b.index ? 1 : -1 : a.delay > b.delay ? 1 : -1;
}

var Task = function Task(delay, state, work, scheduler) {
    _classCallCheck(this, Task);

    this.delay = delay;
    this.state = state;
    this.work = work;
};

exports.Task = Task;

//# sourceMappingURL=virtual-scheduler.js.map