'use strict';

exports.__esModule = true;
exports['default'] = skip;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _SubscriberFactory2 = require('../SubscriberFactory');

var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

var SkipSubscriber = (function (_Subscriber) {
    function SkipSubscriber(destination, count) {
        _classCallCheck(this, SkipSubscriber);

        _Subscriber.call(this, destination);
        this.counter = 0;
        this.count = count;
    }

    _inherits(SkipSubscriber, _Subscriber);

    SkipSubscriber.prototype._next = function _next(value) {
        if (this.counter++ >= this.count) {
            return this.destination.next(value);
        }
    };

    return SkipSubscriber;
})(_Subscriber3['default']);

var SkipSubscriberFactory = (function (_SubscriberFactory) {
    function SkipSubscriberFactory(count) {
        _classCallCheck(this, SkipSubscriberFactory);

        _SubscriberFactory.call(this);
        this.count = count;
    }

    _inherits(SkipSubscriberFactory, _SubscriberFactory);

    SkipSubscriberFactory.prototype.create = function create(destination) {
        return new SkipSubscriber(destination, this.count);
    };

    return SkipSubscriberFactory;
})(_SubscriberFactory3['default']);

function skip(count) {
    return this.lift(new SkipSubscriberFactory(count));
}

;
module.exports = exports['default'];