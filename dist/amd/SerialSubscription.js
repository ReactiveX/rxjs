define(['exports', 'module', './Subscription'], function (exports, module, _Subscription2) {
    'use strict';

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Subscription3 = _interopRequireDefault(_Subscription2);

    var SerialSubscription = (function (_Subscription) {
        function SerialSubscription(subscription) {
            _classCallCheck(this, SerialSubscription);

            _Subscription.call(this, null, null);
            this.subscription = subscription;
        }

        _inherits(SerialSubscription, _Subscription);

        SerialSubscription.prototype.add = function add(subscription) {
            if (subscription) {
                if (this.unsubscribed) {
                    subscription.unsubscribe();
                } else {
                    var currentSubscription = this.subscription;
                    this.subscription = subscription;
                    if (currentSubscription) {
                        currentSubscription.unsubscribe();
                    }
                }
            }
            return this;
        };

        SerialSubscription.prototype.remove = function remove(subscription) {
            if (this.subscription === subscription) {
                this.subscription = undefined;
            }
            return this;
        };

        SerialSubscription.prototype.unsubscribe = function unsubscribe() {
            if (this.unsubscribed) {
                return;
            }
            this.unsubscribed = true;
            var subscription = this.subscription;
            if (subscription) {
                this.subscription = undefined;
                subscription.unsubscribe();
            }
        };

        return SerialSubscription;
    })(_Subscription3['default']);

    module.exports = SerialSubscription;
});