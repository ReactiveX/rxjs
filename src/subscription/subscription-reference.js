var SubscriptionReference = (function () {
    function SubscriptionReference(subscription) {
        if (subscription === void 0) { subscription = null; }
        this._subscription = subscription;
        this._isDisposeScheduled = false;
        this._isDisposed = false;
    }
    Object.defineProperty(SubscriptionReference.prototype, "value", {
        get: function () {
            return this._subscription;
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
        this._subscription = subscription;
        if (this._isDisposeScheduled) {
            this._dispose();
        }
    };
    SubscriptionReference.prototype._dispose = function () {
        this._subscription.dispose();
        this._isDisposeScheduled = false;
        this._isDisposed = true;
    };
    SubscriptionReference.prototype.dispose = function () {
        if (!this._subscription) {
            this._isDisposeScheduled = true;
        }
        else {
            this._dispose();
        }
    };
    return SubscriptionReference;
})();
exports.default = SubscriptionReference;
