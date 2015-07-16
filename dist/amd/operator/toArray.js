define(['exports', 'module', '../Subscriber', '../SubscriberFactory'], function (exports, module, _Subscriber2, _SubscriberFactory2) {
    'use strict';

    module.exports = toArray;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Subscriber3 = _interopRequireDefault(_Subscriber2);

    var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

    var ToArraySubscriber = (function (_Subscriber) {
        function ToArraySubscriber(destination) {
            _classCallCheck(this, ToArraySubscriber);

            _Subscriber.call(this, destination);
            this.array = [];
        }

        _inherits(ToArraySubscriber, _Subscriber);

        ToArraySubscriber.prototype._next = function _next(value) {
            this.array.push(value);
        };

        ToArraySubscriber.prototype._complete = function _complete(value) {
            this.destination.next(this.array);
            this.destination.complete(value);
        };

        return ToArraySubscriber;
    })(_Subscriber3['default']);

    var ToArraySubscriberFactory = (function (_SubscriberFactory) {
        function ToArraySubscriberFactory() {
            _classCallCheck(this, ToArraySubscriberFactory);

            _SubscriberFactory.apply(this, arguments);
        }

        _inherits(ToArraySubscriberFactory, _SubscriberFactory);

        ToArraySubscriberFactory.prototype.create = function create(destination) {
            return new ToArraySubscriber(destination);
        };

        return ToArraySubscriberFactory;
    })(_SubscriberFactory3['default']);

    function toArray() {
        return this.lift(new ToArraySubscriberFactory());
    }
});