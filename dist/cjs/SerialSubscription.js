"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SerialSubscription = (function () {
    function SerialSubscription(subscription) {
        _classCallCheck(this, SerialSubscription);

        this.isUnsubscribed = false;
        this.subscription = subscription;
    }

    SerialSubscription.prototype.add = function add(subscription) {
        if (subscription) {
            if (this.isUnsubscribed) {
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
        if (!this.isUnsubscribed) {
            this.isUnsubscribed = true;
            var subscription = this.subscription;
            if (subscription) {
                this.subscription = undefined;
                subscription.unsubscribe();
            }
        }
    };

    return SerialSubscription;
})();

exports["default"] = SerialSubscription;
module.exports = exports["default"];