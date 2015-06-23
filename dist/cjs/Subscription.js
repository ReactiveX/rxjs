'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Subscription = (function () {
    function Subscription(_unsubscribe, observer) {
        _classCallCheck(this, Subscription);

        this.length = 0;
        this.unsubscribed = false;
        this._unsubscribe = _unsubscribe;
        this.observer = observer;
        if (observer) {
            observer.setSubscription(this);
        }
    }

    Subscription.prototype.unsubscribe = function unsubscribe() {
        if (this.unsubscribed) {
            return;
        }
        this.unsubscribed = true;
        var unsubscribe = this._unsubscribe;
        if (unsubscribe) {
            this._unsubscribe = undefined;
            unsubscribe.call(this);
        }
        var observer = this.observer;
        if (observer) {
            this.observer = undefined;
            if (observer.dispose && observer._dispose) {
                observer.dispose();
            } else if (observer['return'] && observer._return) {
                observer['return']();
            }
        }
    };

    Subscription.prototype.add = function add(subscription) {
        return this;
    };

    Subscription.prototype.remove = function remove(subscription) {
        return this;
    };

    Subscription.from = function from(value, observer) {
        if (!value) {
            return new Subscription(undefined, observer);
        } else if (value && typeof value.unsubscribe === 'function') {
            return value;
        } else if (typeof value === 'function') {
            return new Subscription(value, observer);
        }
    };

    return Subscription;
})();

exports['default'] = Subscription;
module.exports = exports['default'];