'use strict';

exports.__esModule = true;
exports['default'] = take;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _SubscriberFactory2 = require('../SubscriberFactory');

var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

var TakeSubscriber = (function (_Subscriber) {
    function TakeSubscriber(destination, count) {
        _classCallCheck(this, TakeSubscriber);

        _Subscriber.call(this, destination);
        this.counter = 0;
        this.count = count;
    }

    _inherits(TakeSubscriber, _Subscriber);

    TakeSubscriber.prototype._next = function _next(value) {
        if (this.counter++ < this.count) {
            this.destination.next(value);
        } else {
            this.destination.complete();
        }
    };

    return TakeSubscriber;
})(_Subscriber3['default']);

var TakeSubscriberFactory = (function (_SubscriberFactory) {
    function TakeSubscriberFactory(count) {
        _classCallCheck(this, TakeSubscriberFactory);

        _SubscriberFactory.call(this);
        this.count = count;
    }

    _inherits(TakeSubscriberFactory, _SubscriberFactory);

    TakeSubscriberFactory.prototype.create = function create(destination) {
        return new TakeSubscriber(destination, this.count);
    };

    return TakeSubscriberFactory;
})(_SubscriberFactory3['default']);

function take(count) {
    return this.lift(new TakeSubscriberFactory(count));
}

;
module.exports = exports['default'];