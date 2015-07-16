define(['exports', 'module', '../Subscriber', '../util/tryCatch', '../util/errorObject', '../SubscriberFactory'], function (exports, module, _Subscriber2, _utilTryCatch, _utilErrorObject, _SubscriberFactory2) {
    'use strict';

    module.exports = select;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Subscriber3 = _interopRequireDefault(_Subscriber2);

    var _try_catch = _interopRequireDefault(_utilTryCatch);

    var _error_obj = _interopRequireDefault(_utilErrorObject);

    var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

    var FilterSubscriber = (function (_Subscriber) {
        function FilterSubscriber(destination, predicate) {
            _classCallCheck(this, FilterSubscriber);

            _Subscriber.call(this, destination);
            this.predicate = predicate;
        }

        _inherits(FilterSubscriber, _Subscriber);

        FilterSubscriber.prototype._next = function _next(value) {
            var result = _try_catch['default'](this.predicate).call(this, value);
            if (result === _error_obj['default']) {
                this.destination.error(_error_obj['default'].e);
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
});