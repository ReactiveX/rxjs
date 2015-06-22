'use strict';

exports.__esModule = true;
exports['default'] = take;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observer2 = require('../Observer');

var _Observer3 = _interopRequireDefault(_Observer2);

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var _Subscription = require('../Subscription');

var _Subscription2 = _interopRequireDefault(_Subscription);

var TakeObserver = (function (_Observer) {
    function TakeObserver(destination, count) {
        _classCallCheck(this, TakeObserver);

        _Observer.call(this, destination);
        this.counter = 0;
        this.count = count;
    }

    _inherits(TakeObserver, _Observer);

    TakeObserver.prototype._next = function _next(value) {
        if (this.counter++ < this.count) {
            return this.destination.next(value);
        } else {
            return this.destination['return']();
        }
    };

    return TakeObserver;
})(_Observer3['default']);

var TakeObservable = (function (_Observable) {
    function TakeObservable(source, count) {
        _classCallCheck(this, TakeObservable);

        _Observable.call(this, null);
        this.source = source;
        this.count = count;
    }

    _inherits(TakeObservable, _Observable);

    TakeObservable.prototype.subscriber = function subscriber(observer) {
        var takeObserver = new TakeObserver(observer, this.count);
        return _Subscription2['default'].from(this.source.subscriber(takeObserver), takeObserver);
    };

    return TakeObservable;
})(_Observable3['default']);

function take(count) {
    return new TakeObservable(this, count);
}

;
module.exports = exports['default'];