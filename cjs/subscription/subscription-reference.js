"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SubscriptionReference = (function () {
    function SubscriptionReference() {
        var subscription = arguments[0] === undefined ? null : arguments[0];

        _classCallCheck(this, SubscriptionReference);

        this._subscription = subscription;
        this._isDisposeScheduled = false;
        this._isDisposed = false;
    }

    _createClass(SubscriptionReference, [{
        key: "value",
        get: function () {
            return this._subscription;
        },
        set: function (subcription) {
            this.setSubscription(subcription);
        }
    }, {
        key: "isDisposed",
        get: function () {
            return this._isDisposeScheduled || this._isDisposed;
        }
    }, {
        key: "setSubscription",
        value: function setSubscription(subscription) {
            this._subscription = subscription;
            if (this._isDisposeScheduled) {
                this._dispose();
            }
        }
    }, {
        key: "_dispose",
        value: function _dispose() {
            this._subscription.dispose();
            this._isDisposeScheduled = false;
            this._isDisposed = true;
        }
    }, {
        key: "dispose",
        value: function dispose() {
            if (!this._subscription) {
                this._isDisposeScheduled = true;
            } else {
                this._dispose();
            }
        }
    }]);

    return SubscriptionReference;
})();

exports["default"] = SubscriptionReference;
module.exports = exports["default"];

//# sourceMappingURL=subscription-reference.js.map