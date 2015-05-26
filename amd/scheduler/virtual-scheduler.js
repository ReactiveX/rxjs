define(['exports', './scheduler', './task'], function (exports, _scheduler, _task) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Scheduler2 = _interopRequire(_scheduler);

    var _Task2 = _interopRequire(_task);

    /**
      A scheduler that might be used for deterministic tests.
      @class VirtualScheduler
    */

    var VirtualScheduler = (function (_Scheduler) {
        function VirtualScheduler() {
            _classCallCheck(this, VirtualScheduler);

            _get(Object.getPrototypeOf(VirtualScheduler.prototype), 'constructor', this).call(this);
            this._index = 0;
            this._queue = [];
        }

        _inherits(VirtualScheduler, _Scheduler);

        _createClass(VirtualScheduler, [{
            key: 'now',
            value: function now(state, work) {
                this.schedule(0, state, work);
            }
        }, {
            key: 'schedule',

            /**
              Schedules a task, but tasks are not run until `flush` is called.
            */
            value: function schedule(delay, state, work) {
                var task = new VirtualTask(delay, state, work, this, this._index++);
                this._queue.push(task);
            }
        }, {
            key: 'flush',

            /**
              executes all tasks queued in the virtual scheduler to the specified delay.
              specified delay. If the
              @method flush
              @param toDelay {number} [optional] delay in milliseconds, if not passed or falsy,
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
            key: 'dispose',
            value: function dispose() {
                this._queue = null;
            }
        }]);

        return VirtualScheduler;
    })(_Scheduler2);

    exports['default'] = VirtualScheduler;

    function taskSort(a, b) {
        return a.delay === b.delay ? a.index > b.index ? 1 : -1 : a.delay > b.delay ? 1 : -1;
    }

    var VirtualTask = (function (_Task) {
        function VirtualTask(delay, state, work, scheduler, index) {
            _classCallCheck(this, VirtualTask);

            _get(Object.getPrototypeOf(VirtualTask.prototype), 'constructor', this).call(this, delay, state, work, scheduler);
            this.index = index;
        }

        _inherits(VirtualTask, _Task);

        return VirtualTask;
    })(_Task2);

    exports.VirtualTask = VirtualTask;
});

//# sourceMappingURL=virtual-scheduler.js.map