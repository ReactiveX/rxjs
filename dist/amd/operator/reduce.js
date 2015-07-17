define(['exports', 'module', '../util/tryCatch', '../util/errorObject', '../Subscriber', '../SubscriberFactory'], function (exports, module, _utilTryCatch, _utilErrorObject, _Subscriber2, _SubscriberFactory2) {
    'use strict';

    module.exports = reduce;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _try_catch = _interopRequireDefault(_utilTryCatch);

    var _error_obj = _interopRequireDefault(_utilErrorObject);

    var _Subscriber3 = _interopRequireDefault(_Subscriber2);

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
            var result = _try_catch['default'](this.processor)(this.aggregate, value);
            if (result === _error_obj['default'].e) {
                this.destination.error(_error_obj['default'].e);
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
});