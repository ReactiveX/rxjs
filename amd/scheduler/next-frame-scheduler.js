define(['exports', 'module', './micro-task-queue'], function (exports, module, _microTaskQueue) {
    'use strict';

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _MicroTaskQueue = _interopRequire(_microTaskQueue);

    //TODO: sniff for nextTick or setImmediate

    var NextFrameScheduler = (function () {
        function NextFrameScheduler(taskQueueGap) {
            _classCallCheck(this, NextFrameScheduler);

            this._timeouts = [];
            this._queue = new _MicroTaskQueue(taskQueueGap || 0);
        }

        _createClass(NextFrameScheduler, [{
            key: 'schedule',
            value: function schedule(delay, state, work) {
                var argsLen = arguments.length;
                if (argsLen === 2) {
                    work = state;
                    state = delay;
                    delay = 0;
                } else if (argsLen === 1) {
                    work = delay;
                    state = undefined;
                    delay = 0;
                }
                if (delay === 0) {
                    this._queue.enqueue(state, work, this);
                } else if (delay > 0) {
                    var self = this;
                    // TODO: will this be more performant if it's using a MicroTaskQueue for each delay (cleared after frame end)?
                    var id = window.setTimeout(function () {
                        work(self, state);
                    }, delay);
                    this._timeouts.push(id);
                }
            }
        }, {
            key: 'dispose',
            value: function dispose() {
                if (this._queue) {
                    this._queue.dispose();
                }
                while (this._timeouts.length) {
                    window.clearTimeout(this._timeouts.shift());
                }
            }
        }]);

        return NextFrameScheduler;
    })();

    module.exports = NextFrameScheduler;
});

//# sourceMappingURL=next-frame-scheduler.js.map