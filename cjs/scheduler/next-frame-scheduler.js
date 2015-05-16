'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _microTaskQueue = require('./micro-task-queue');

var _microTaskQueue2 = _interopRequireDefault(_microTaskQueue);

//TODO: sniff for nextTick or setImmediate

var NextFrameScheduler = (function () {
    function NextFrameScheduler(taskQueueGap) {
        _classCallCheck(this, NextFrameScheduler);

        this._timeouts = [];
        this._queue = new _microTaskQueue2['default'](taskQueueGap || 0);
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

exports['default'] = NextFrameScheduler;
module.exports = exports['default'];

//# sourceMappingURL=next-frame-scheduler.js.map