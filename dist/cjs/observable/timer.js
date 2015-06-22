'use strict';

exports.__esModule = true;
exports['default'] = timer;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var _schedulerNextTick = require('../scheduler/nextTick');

var _schedulerNextTick2 = _interopRequireDefault(_schedulerNextTick);

var TimerObservable = (function (_Observable) {
    function TimerObservable(delay, scheduler) {
        _classCallCheck(this, TimerObservable);

        _Observable.call(this, null);
        this.delay = delay;
        this.scheduler = scheduler;
    }

    _inherits(TimerObservable, _Observable);

    TimerObservable.prototype.subscriber = function subscriber(observer) {
        this.scheduler.schedule(this.delay, observer, dispatch);
    };

    return TimerObservable;
})(_Observable3['default']);

function dispatch(observer) {
    if (!observer.unsubscribed) {
        observer.next(0);
        observer['return']();
    }
}

function timer() {
    var delay = arguments[0] === undefined ? 0 : arguments[0];
    var scheduler = arguments[1] === undefined ? _schedulerNextTick2['default'] : arguments[1];

    return new TimerObservable(delay, scheduler);
}

;
module.exports = exports['default'];