var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var observer_1 = require('./observer');
var composite_subscription_1 = require('../subscription/composite-subscription');
var subscription_reference_1 = require('../subscription/subscription-reference');
var MergeAllObserver = (function (_super) {
    __extends(MergeAllObserver, _super);
    function MergeAllObserver(generator, subscription) {
        _super.call(this, generator, subscription);
        this._compositeSubscription = new composite_subscription_1["default"]();
    }
    MergeAllObserver.prototype.completed = function (subscription) {
        this._compositeSubscription.remove(subscription);
        return this.checkReturn();
    };
    MergeAllObserver.prototype.checkReturn = function () {
        if (this.canReturn && this._compositeSubscription.length === 0) {
            return this.generator.return(this.returnValue);
        }
    };
    MergeAllObserver.prototype.next = function (observable) {
        var subscription = new subscription_reference_1["default"]();
        this._compositeSubscription.add(subscription);
        var sub;
        try {
            sub = observable.observer(new MergedObservableObserver(this, subscription));
        }
        catch (err) {
            _super.prototype.throw.call(this, err);
        }
        subscription.setSubscription(sub);
        return { done: false, value: undefined }; //NOTE: should value be subscription?
    };
    MergeAllObserver.prototype.return = function (value) {
        this.canReturn = true;
        this.returnValue = value;
        return this.checkReturn();
    };
    return MergeAllObserver;
})(observer_1["default"]);
exports["default"] = MergeAllObserver;
var MergedObservableObserver = (function (_super) {
    __extends(MergedObservableObserver, _super);
    function MergedObservableObserver(source, subscription) {
        _super.call(this, source._generator, subscription);
        this._source = source;
    }
    MergedObservableObserver.prototype.return = function () {
        return this._source.completed(this.subscription);
    };
    return MergedObservableObserver;
})(observer_1["default"]);
exports.MergedObservableObserver = MergedObservableObserver;
