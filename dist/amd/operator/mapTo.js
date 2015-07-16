define(['exports', 'module', '../Subscriber', '../SubscriberFactory'], function (exports, module, _Subscriber2, _SubscriberFactory2) {
    'use strict';

    module.exports = mapTo;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Subscriber3 = _interopRequireDefault(_Subscriber2);

    var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

    var MapToSubscriber = (function (_Subscriber) {
        function MapToSubscriber(destination, value) {
            _classCallCheck(this, MapToSubscriber);

            _Subscriber.call(this, destination);
            this.value = value;
        }

        _inherits(MapToSubscriber, _Subscriber);

        MapToSubscriber.prototype._next = function _next(_) {
            return this.destination.next(this.value);
        };

        return MapToSubscriber;
    })(_Subscriber3['default']);

    var MapToSubscriberFactory = (function (_SubscriberFactory) {
        function MapToSubscriberFactory(value) {
            _classCallCheck(this, MapToSubscriberFactory);

            _SubscriberFactory.call(this);
            this.value = value;
        }

        _inherits(MapToSubscriberFactory, _SubscriberFactory);

        MapToSubscriberFactory.prototype.create = function create(destination) {
            return new MapToSubscriber(destination, this.value);
        };

        return MapToSubscriberFactory;
    })(_SubscriberFactory3['default']);

    function mapTo(value) {
        return this.lift(new MapToSubscriberFactory(value));
    }

    ;
});