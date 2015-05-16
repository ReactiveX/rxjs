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
    function MergeAllObserver(generator, subscriptionRef) {
        _super.call(this, generator, subscriptionRef);
        this._compositeSubscription = new composite_subscription_1.default();
    }
    MergeAllObserver.prototype.completed = function (subscriptionRef) {
        this._compositeSubscription.remove(subscriptionRef);
        this.checkReturn();
    };
    MergeAllObserver.prototype.checkReturn = function () {
        if (this.canReturn && this._compositeSubscription.length === 0) {
            var _return = this._generator.return;
            if (_return) {
                _return.call(this, this.returnValue);
            }
        }
    };
    MergeAllObserver.prototype.next = function (observable) {
        var subscriptionRef = new subscription_reference_1.default();
        this._compositeSubscription.add(subscriptionRef);
        var sub;
        try {
            sub = observable.observer(new MergedObservableObserver(this, subscriptionRef));
        }
        catch (err) {
            _super.prototype.throw.call(this, err);
        }
        subscriptionRef.setSubscription(sub);
    };
    MergeAllObserver.prototype.return = function (value) {
        this.canReturn = true;
        this.returnValue = value;
        return this.checkReturn();
    };
    return MergeAllObserver;
})(observer_1.default);
exports.default = MergeAllObserver;
var MergedObservableObserver = (function (_super) {
    __extends(MergedObservableObserver, _super);
    function MergedObservableObserver(source, subscriptionRef) {
        _super.call(this, source._generator, subscriptionRef);
        this._source = source;
    }
    MergedObservableObserver.prototype.return = function () {
        this._source.completed(this._subscriptionDisposable);
    };
    return MergedObservableObserver;
})(observer_1.default);
exports.MergedObservableObserver = MergedObservableObserver;
