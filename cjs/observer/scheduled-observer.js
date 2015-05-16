'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _observer = require('./observer');

var _observer2 = _interopRequireDefault(_observer);

/**
  An observer that takes a scheduler to emit values and errors on.
  @class ScheduledObserver
  @extends {Observer}
*/

var ScheduledObserver = (function (_Observer) {
    function ScheduledObserver(observationScheduler, generator, subscriptionDisposable) {
        _classCallCheck(this, ScheduledObserver);

        _get(Object.getPrototypeOf(ScheduledObserver.prototype), 'constructor', this).call(this, generator, subscriptionDisposable);
        this._observationScheduler = observationScheduler;
    }

    _inherits(ScheduledObserver, _Observer);

    _createClass(ScheduledObserver, [{
        key: 'next',
        value: function next(value) {
            this._observationScheduler.schedule(0, value, this._next.bind(this));
        }
    }, {
        key: '_next',
        value: function _next(scheduler, value) {
            _get(Object.getPrototypeOf(ScheduledObserver.prototype), 'next', this).call(this, value);
        }
    }, {
        key: 'throw',
        value: function _throw(value) {
            this._observationScheduler.schedule(0, value, this._throw.bind(this));
        }
    }, {
        key: '_throw',
        value: function _throw(scheduler, value) {
            _get(Object.getPrototypeOf(ScheduledObserver.prototype), 'throw', this).call(this, value);
        }
    }, {
        key: 'return',
        value: function _return(value) {
            this._observationScheduler.schedule(0, value, this._return.bind(this));
        }
    }, {
        key: '_return',
        value: function _return(scheduler, value) {
            _get(Object.getPrototypeOf(ScheduledObserver.prototype), 'return', this).call(this, value);
        }
    }]);

    return ScheduledObserver;
})(_observer2['default']);

exports['default'] = ScheduledObserver;
module.exports = exports['default'];

//# sourceMappingURL=scheduled-observer.js.map