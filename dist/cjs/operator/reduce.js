'use strict';

exports.__esModule = true;
exports['default'] = reduce;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _utilTryCatch = require('../util/tryCatch');

var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);

var _utilErrorObject = require('../util/errorObject');

var _utilErrorObject2 = _interopRequireDefault(_utilErrorObject);

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _SubscriberFactory2 = require('../SubscriberFactory');

var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

var ReduceSubscriber = (function (_Subscriber) {
    function ReduceSubscriber(destination, processor, initialValue) {
        _classCallCheck(this, ReduceSubscriber);

        _Subscriber.call(this, destination);
        this.processor = processor;
        this.aggregate = initialValue;
    }

    _inherits(ReduceSubscriber, _Subscriber);

    ReduceSubscriber.prototype._next = function _next(value) {
        var result = _utilTryCatch2['default'](this.processor)(this.aggregate, value);
        if (result === _utilErrorObject2['default'].e) {
            this.destination.error(_utilErrorObject2['default'].e);
        } else {
            this.aggregate = result;
        }
    };

    ReduceSubscriber.prototype._complete = function _complete(value) {
        this.destination.next(this.aggregate);
        this.destination.complete(value);
    };

    return ReduceSubscriber;
})(_Subscriber3['default']);

var ReduceSubscriberFactory = (function (_SubscriberFactory) {
    function ReduceSubscriberFactory(processor, initialValue) {
        _classCallCheck(this, ReduceSubscriberFactory);

        _SubscriberFactory.call(this);
        this.processor = processor;
        this.initialValue = initialValue;
    }

    _inherits(ReduceSubscriberFactory, _SubscriberFactory);

    ReduceSubscriberFactory.prototype.create = function create(destination) {
        return new ReduceSubscriber(destination, this.processor, this.initialValue);
    };

    return ReduceSubscriberFactory;
})(_SubscriberFactory3['default']);

function reduce(processor, initialValue) {
    return this.lift(new ReduceSubscriberFactory(processor, initialValue));
}

module.exports = exports['default'];