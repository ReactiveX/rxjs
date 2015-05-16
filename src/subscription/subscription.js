var Subscription = (function () {
    function Subscription(action) {
        this.isDisposed = false;
        this._action = action;
    }
    Subscription.prototype.dispose = function () {
        if (!this.isDisposed && this._action) {
            this._action();
        }
        this.isDisposed = true;
    };
    Subscription.prototype.child = function (action) {
        var ChildSubscription = function (action) {
            this._action = action;
        };
        ChildSubscription.prototype = this;
        return new ChildSubscription(action);
    };
    return Subscription;
})();
exports.default = Subscription;
