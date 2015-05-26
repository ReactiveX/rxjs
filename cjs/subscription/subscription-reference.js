var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var subscription_1 = require('./subscription');
var SubscriptionReference = (function (_super) {
    __extends(SubscriptionReference, _super);
    function SubscriptionReference(subscription) {
        if (subscription === void 0) { subscription = null; }
        _super.call(this, null);
        this.isReference = true;
        this.subscription = subscription;
        this._isDisposeScheduled = false;
        this._isDisposed = false;
    }
    Object.defineProperty(SubscriptionReference.prototype, "value", {
        get: function () {
            return this.subscription;
        },
        set: function (subcription) {
            this.setSubscription(subcription);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubscriptionReference.prototype, "isDisposed", {
        get: function () {
            return this._isDisposeScheduled || this._isDisposed;
        },
        enumerable: true,
        configurable: true
    });
    SubscriptionReference.prototype.setSubscription = function (subscription) {
        this.subscription = subscription;
        if (this._isDisposeScheduled) {
            this._dispose();
        }
    };
    SubscriptionReference.prototype._dispose = function () {
        this.subscription.dispose();
        this._isDisposeScheduled = false;
        this._isDisposed = true;
    };
    SubscriptionReference.prototype.dispose = function () {
        if (!this.subscription) {
            this._isDisposeScheduled = true;
        }
        else {
            this._dispose();
        }
    };
    return SubscriptionReference;
})(subscription_1["default"]);
exports["default"] = SubscriptionReference;
