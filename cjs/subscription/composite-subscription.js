var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var subscription_1 = require('./subscription');
var CompositeSubscription = (function (_super) {
    __extends(CompositeSubscription, _super);
    function CompositeSubscription() {
        var subscriptions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            subscriptions[_i - 0] = arguments[_i];
        }
        _super.call(this);
        this._subscriptions = subscriptions;
    }
    CompositeSubscription.prototype.add = function (subscription) {
        this._subscriptions.push(subscription);
    };
    CompositeSubscription.prototype.remove = function (subscription) {
        this._subscriptions.splice(this._subscriptions.indexOf(subscription), 1);
    };
    Object.defineProperty(CompositeSubscription.prototype, "length", {
        get: function () {
            return this._subscriptions.length;
        },
        enumerable: true,
        configurable: true
    });
    CompositeSubscription.prototype.dispose = function () {
        while (this._subscriptions.length > 1) {
            var subcription = this._subscriptions.pop();
            subcription.dispose();
        }
        return subscription_1["default"].prototype.dispose.call(this);
    };
    return CompositeSubscription;
})(subscription_1["default"]);
exports["default"] = CompositeSubscription;
