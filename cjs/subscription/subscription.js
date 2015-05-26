var noop_1 = require('../util/noop');
var Subscription = (function () {
    function Subscription(action) {
        if (action === void 0) { action = noop_1["default"]; }
        this.isDisposed = false;
        this._action = action;
    }
    Subscription.prototype.dispose = function () {
        if (!this.isDisposed && this._action) {
            this._action();
        }
        this.isDisposed = true;
    };
    return Subscription;
})();
exports["default"] = Subscription;
