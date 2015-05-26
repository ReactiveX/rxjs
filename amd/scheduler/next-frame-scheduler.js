define(['exports', 'module', './scheduler', './micro-task-queue'], function (exports, module, _scheduler, _microTaskQueue) {
    'use strict';

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Scheduler2 = _interopRequire(_scheduler);

    var _MicroTaskQueue = _interopRequire(_microTaskQueue);

    var NextFrameScheduler = (function (_Scheduler) {
        function NextFrameScheduler() {
            _classCallCheck(this, NextFrameScheduler);

            _get(Object.getPrototypeOf(NextFrameScheduler.prototype), 'constructor', this).call(this);
            this._queue = new _MicroTaskQueue();
        }

        _inherits(NextFrameScheduler, _Scheduler);

        _createClass(NextFrameScheduler, [{
            key: 'schedule',
            value: function schedule(delay, state, work) {
                if (delay === 0) {
                    this._queue.enqueue(state, work, this);
                } else if (delay > 0) {
                    var self = this;
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
    })(_Scheduler2);

    module.exports = NextFrameScheduler;
});

//# sourceMappingURL=next-frame-scheduler.js.map