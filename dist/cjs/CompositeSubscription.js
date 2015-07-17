'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilArraySlice = require('./util/arraySlice');

var _utilArraySlice2 = _interopRequireDefault(_utilArraySlice);

var CompositeSubscription = (function () {
    function CompositeSubscription() {
        _classCallCheck(this, CompositeSubscription);

        this.length = 0;
        this.isUnsubscribed = false;
    }

    CompositeSubscription.from = function from(subscriptions) {
        var comp = new CompositeSubscription();
        if (Array.isArray(subscriptions)) {
            subscriptions.forEach(function (sub) {
                return comp.add(sub);
            });
        }
        return comp;
    };

    CompositeSubscription.prototype.unsubscribe = function unsubscribe() {
        if (this.isUnsubscribed || !this.subscriptions) {
            return;
        }
        this.isUnsubscribed = true;
        var subscriptions = _utilArraySlice2['default'](this.subscriptions);
        var subscriptionCount = subscriptions && subscriptions.length || 0;
        var subscriptionIndex = -1;
        this.subscriptions = undefined;
        while (++subscriptionIndex < subscriptionCount) {
            subscriptions[subscriptionIndex].unsubscribe();
        }
    };

    CompositeSubscription.prototype.add = function add(subscription) {
        var subscriptions = this.subscriptions || (this.subscriptions = []);
        if (subscription && !subscription.isUnsubscribed) {
            if (this.isUnsubscribed) {
                subscription.unsubscribe();
            } else {
                subscriptions.push(subscription);
            }
        }
        this.length = subscriptions.length;
        return this;
    };

    CompositeSubscription.prototype.remove = function remove(subscription) {
        var isUnsubscribed = this.isUnsubscribed;
        var subscriptions = this.subscriptions;
        if (subscriptions) {
            var subscriptionIndex = subscriptions.indexOf(subscription);
            if (subscriptionIndex !== -1) {
                subscriptions.splice(subscriptionIndex, 1);
            }
            this.length = subscriptions.length;
        } else {
            this.length = 0;
        }
        return this;
    };

    CompositeSubscription.prototype.indexOf = function indexOf(subscription) {
        return this.subscriptions.indexOf(subscription);
    };

    return CompositeSubscription;
})();

exports['default'] = CompositeSubscription;
module.exports = exports['default'];