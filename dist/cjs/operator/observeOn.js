'use strict';

exports.__esModule = true;
exports['default'] = observeOn;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var _Observer2 = require('../Observer');

var _Observer3 = _interopRequireDefault(_Observer2);

var _Subscription = require('../Subscription');

var _Subscription2 = _interopRequireDefault(_Subscription);

var ObserveOnObserver = (function (_Observer) {
    function ObserveOnObserver(destination, scheduler) {
        _classCallCheck(this, ObserveOnObserver);

        _Observer.call(this, destination);
        this.scheduler = scheduler;
    }

    _inherits(ObserveOnObserver, _Observer);

    ObserveOnObserver.prototype._next = function _next(value) {
        this.scheduler.schedule(0, [this.destination, value], dispatchNext);
        return { done: false };
    };

    ObserveOnObserver.prototype._throw = function _throw(err) {
        this.scheduler.schedule(0, [this.destination, err], dispatchThrow);
        return { done: true };
    };

    ObserveOnObserver.prototype._return = function _return(value) {
        this.scheduler.schedule(0, [this.destination, value], dispatchReturn);
        return { done: true };
    };

    return ObserveOnObserver;
})(_Observer3['default']);

function dispatchNext(_ref) {
    var destination = _ref[0];
    var value = _ref[1];

    var result = destination.next(value);
    if (result.done) {
        destination.dispose();
    }
}
function dispatchThrow(_ref2) {
    var destination = _ref2[0];
    var err = _ref2[1];

    var result = destination['throw'](err);
    destination.dispose();
}
function dispatchReturn(_ref3) {
    var destination = _ref3[0];
    var value = _ref3[1];

    var result = destination['return'](value);
    destination.dispose();
}

var ObserveOnObservable = (function (_Observable) {
    function ObserveOnObservable(source, scheduler) {
        _classCallCheck(this, ObserveOnObservable);

        _Observable.call(this, null);
        this.source = source;
        this.scheduler = scheduler;
    }

    _inherits(ObserveOnObservable, _Observable);

    ObserveOnObservable.prototype.subscriber = function subscriber(observer) {
        var observeOnObserver = new ObserveOnObserver(observer, this.scheduler);
        return _Subscription2['default'].from(this.source.subscriber(observeOnObserver), observeOnObserver);
    };

    return ObserveOnObservable;
})(_Observable3['default']);

function observeOn(scheduler) {
    return new ObserveOnObservable(this, scheduler);
}

module.exports = exports['default'];