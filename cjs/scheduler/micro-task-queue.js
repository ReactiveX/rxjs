'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilGetBoundNext = require('../util/get-bound-next');

var _utilGetBoundNext2 = _interopRequireDefault(_utilGetBoundNext);

/**
  A micro task queue specialized for scheduler use.
  @class MicroTaskQueue
*/

var MicroTaskQueue = (function () {
    /**
      @contructor
      @param gap {Number} the number of ms before a new frame is queued for task processing.
        if the gap is 0, it will run all tasks in a single frame. (Defaults to 0)
    */

    function MicroTaskQueue(gap) {
        _classCallCheck(this, MicroTaskQueue);

        this._queue = [];
        this._gap = gap || 0;
        this.isProcessing = false;
        this.isDisposed = false;
        this._flushNext = (0, _utilGetBoundNext2['default'])(this.flush.bind(this));
    }

    _createClass(MicroTaskQueue, [{
        key: 'enqueue',

        /**
          Enqueues a task to be run based on the state, work and scheduler passed
          @method enqueue
          @param state {Object} the state to run the work against.
          @param work {Function} the work to be done
          @param scheduler {Scheduler} the scheduler the work is being done for.
          @return {MicroTask} a micro task which is disposable.
        */
        value: function enqueue(state, work, scheduler) {
            var task = new MicroTask(this, state, work, scheduler);
            this._queue.push(task);
            this.scheduleFlush();
            return task;
        }
    }, {
        key: 'dequeue',

        /**
          Removes a micro task from the queue
          @method dequeue
          @param task {MicroTask} the task to dequeue
        */
        value: function dequeue(task) {
            this._queue.splice(this._queue.indexOf(task), 1);
        }
    }, {
        key: 'dispose',

        /**
          Clears the queue and prevents any delayed execution of tasks.
          @method dispose
        */
        value: function dispose() {
            this._queue.length = 0;
            this.isProcessing = false;
            this.isDisposed = true;
        }
    }, {
        key: 'scheduleFlush',

        /**
          Schedules a flush to be called as a micro task if possible. Otherwise as a setTimeout.
          See `utils/get-bound-next'
          @method scheduleFlush
        */
        value: function scheduleFlush() {
            if (!this.isProcessing) {
                this.isProcessing = true;
                this._flushNext();
            }
        }
    }, {
        key: 'flush',

        /**
          Processes the queue of tasks.
          @method flush
        */
        value: function flush() {
            var start = Date.now();
            while (this._queue.length > 0) {
                var task = this._queue.shift();
                task.work(task.scheduler, task.state);
                if (this._gap > 0 && Date.now() - start > this._gap) {
                    break;
                }
            }
            if (this._queue.length > 0) {
                this._flushNext();
            } else {
                this.isProcessing = false;
            }
        }
    }]);

    return MicroTaskQueue;
})();

exports['default'] = MicroTaskQueue;

/**
  A structure for defining a task on a MicroTaskQueue
  @class MicroTask
*/

var MicroTask = (function () {
    function MicroTask(queue, state, work, scheduler) {
        _classCallCheck(this, MicroTask);

        this.queue = queue;
        this.state = state;
        this.work = work;
        this.scheduler = scheduler;
    }

    _createClass(MicroTask, [{
        key: 'dispose',

        /**
          dequeues the task from it's queue
          @method dispose
        */
        value: function dispose() {
            this.queue.dequeue(this);
        }
    }]);

    return MicroTask;
})();

module.exports = exports['default'];

//# sourceMappingURL=micro-task-queue.js.map