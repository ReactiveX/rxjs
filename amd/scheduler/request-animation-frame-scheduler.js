define(['exports', 'module', './scheduler'], function (exports, module, _scheduler) {
    'use strict';

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Scheduler2 = _interopRequire(_scheduler);

    var RequestAnimationFrameScheduler = (function (_Scheduler) {
        function RequestAnimationFrameScheduler() {
            _classCallCheck(this, RequestAnimationFrameScheduler);

            _get(Object.getPrototypeOf(RequestAnimationFrameScheduler.prototype), 'constructor', this).call(this);
        }

        _inherits(RequestAnimationFrameScheduler, _Scheduler);

        _createClass(RequestAnimationFrameScheduler, [{
            key: 'schedule',
            value: function schedule(delay, state, work) {
                var argsLen = arguments.length;
                if (delay === 0) {
                    requestAnimationFrame(function () {
                        work(self, state);
                    });
                } else if (delay > 0) {
                    var self = this;
                    var id = setTimeout(function () {
                        requestAnimationFrame(function () {
                            work(self, state);
                        });
                    }, delay);
                    this._timeouts.push(id);
                }
            }
        }, {
            key: 'dispose',
            value: function dispose() {
                while (this._timeouts.length) {
                    clearTimeout(this._timeouts.shift());
                }
            }
        }]);

        return RequestAnimationFrameScheduler;
    })(_Scheduler2);

    module.exports = RequestAnimationFrameScheduler;
});

//# sourceMappingURL=request-animation-frame-scheduler.js.map