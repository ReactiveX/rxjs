'use strict';

exports.__esModule = true;
exports['default'] = select;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _utilTryCatch = require('../util/tryCatch');

var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);

var _utilErrorObject = require('../util/errorObject');

var _utilErrorObject2 = _interopRequireDefault(_utilErrorObject);

var _SubscriberFactory2 = require('../SubscriberFactory');

var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

var FilterSubscriber = (function (_Subscriber) {
    function FilterSubscriber(destination, predicate) {
        _classCallCheck(this, FilterSubscriber);

        _Subscriber.call(this, destination);
        this.predicate = predicate;
    }

    _inherits(FilterSubscriber, _Subscriber);

    FilterSubscriber.prototype._next = function _next(value) {
        var result = _utilTryCatch2['default'](this.predicate).call(this, value);
        if (result === _utilErrorObject2['default']) {
            this.destination.error(_utilErrorObject2['default'].e);
        } else if (Boolean(result)) {
            this.destination.next(value);
        }
    };

    return FilterSubscriber;
})(_Subscriber3['default']);

var FilterSubscriberFactory = (function (_SubscriberFactory) {
    function FilterSubscriberFactory(predicate) {
        _classCallCheck(this, FilterSubscriberFactory);

        _SubscriberFactory.call(this);
        this.predicate = predicate;
    }

    _inherits(FilterSubscriberFactory, _SubscriberFactory);

    FilterSubscriberFactory.prototype.create = function create(destination) {
        return new FilterSubscriber(destination, this.predicate);
    };

    return FilterSubscriberFactory;
})(_SubscriberFactory3['default']);

function select(predicate) {
    return this.lift(new FilterSubscriberFactory(predicate));
}

;
module.exports = exports['default'];