define(['exports', 'module', '../Observable', '../scheduler/nextTick', '../util/Symbol_observer'], function (exports, module, _Observable2, _schedulerNextTick, _utilSymbol_observer) {
    'use strict';

    module.exports = timer;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observable3 = _interopRequireDefault(_Observable2);

    var _nextTick = _interopRequireDefault(_schedulerNextTick);

    var _$$observer = _interopRequireDefault(_utilSymbol_observer);

    var TimerObservable = (function (_Observable) {
        function TimerObservable(delay, scheduler) {
            _classCallCheck(this, TimerObservable);

            _Observable.call(this, null);
            this.delay = delay;
            this.scheduler = scheduler;
        }

        _inherits(TimerObservable, _Observable);

        TimerObservable.prototype[_$$observer['default']] = function (observer) {
            this.scheduler.schedule(this.delay, observer, dispatch);
        };

        return TimerObservable;
    })(_Observable3['default']);

    function dispatch(observer) {
        if (!observer.unsubscribed) {
            observer.next(0);
            observer.complete();
        }
    }

    function timer() {
        var delay = arguments[0] === undefined ? 0 : arguments[0];
        var scheduler = arguments[1] === undefined ? _nextTick['default'] : arguments[1];

        return new TimerObservable(delay, scheduler);
    }

    ;
});