var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var observer_1 = require('../observer/observer');
var map_observer_1 = require('../observer/map-observer');
var subscription_reference_1 = require('../subscription/subscription-reference');
var merge_all_observer_1 = require('../observer/merge-all-observer');
var subscription_1 = require('../subscription/subscription');
var current_frame_1 = require('../scheduler/global/current-frame');
var scheduled_observer_1 = require('../observer/scheduled-observer');
var noop_1 = require('../util/noop');
var Observable = (function () {
    function Observable(observer, scheduler) {
        if (observer === void 0) { observer = noop_1["default"]; }
        if (scheduler === void 0) { scheduler = current_frame_1["default"]; }
        this._observer = observer;
        this._scheduler = scheduler || current_frame_1["default"];
    }
    Observable.prototype._observer = function (generator) {
        return void (0);
    };
    Observable.return = function (value) {
        return Observable.create(function (generator) {
            generator.next(value);
            generator.return(value);
        });
    };
    Observable.create = function (observer) {
        return new Observable(observer);
    };
    Observable.prototype.observer = function (generator) {
        var subref = new subscription_reference_1["default"]();
        var state = {
            source: this,
            generator: new observer_1["default"](generator, subref),
            subscription: subref
        };
        this._scheduler.schedule(0, state, this.scheduledObservation);
        return state.subscription;
    };
    Observable.prototype.scheduledObservation = function (scheduler, state) {
        var result = state.source._observer(state.generator);
        var subscription;
        switch (typeof result) {
            case 'undefined':
                subscription = new subscription_1["default"](noop_1["default"]);
                break;
            case 'function':
                subscription = new subscription_1["default"](result);
                break;
            default:
                subscription = result;
                break;
        }
        state.subscription.setSubscription(subscription);
    };
    // Observable/Observer pair methods
    Observable.prototype.map = function (projection) {
        return new MapObservable(this, projection);
    };
    Observable.prototype.flatMap = function (projection) {
        return this.map(projection).mergeAll();
    };
    Observable.prototype.mergeAll = function () {
        return new MergeAllObservable(this);
    };
    Observable.prototype.observeOn = function (observationScheduler) {
        return new ScheduledObservable(this, observationScheduler);
    };
    return Observable;
})();
exports.Observable = Observable;
var ScheduledObservable = (function (_super) {
    __extends(ScheduledObservable, _super);
    function ScheduledObservable(source, observationScheduler) {
        _super.call(this);
        this._observationScheduler = observationScheduler;
        this._source = source;
    }
    ScheduledObservable.prototype._observer = function (generator) {
        var subscription = new subscription_reference_1["default"]();
        subscription.setSubscription(this._source.observer(new scheduled_observer_1["default"](this._observationScheduler, generator, subscription)));
        return subscription.value;
    };
    return ScheduledObservable;
})(Observable);
exports.ScheduledObservable = ScheduledObservable;
var MergeAllObservable = (function (_super) {
    __extends(MergeAllObservable, _super);
    function MergeAllObservable(source) {
        _super.call(this);
        this._source = source;
    }
    MergeAllObservable.prototype._observer = function (generator) {
        var subscription = new subscription_reference_1["default"]();
        subscription.setSubscription(this._source.observer(new merge_all_observer_1["default"](generator, subscription)));
        return subscription.value;
    };
    return MergeAllObservable;
})(Observable);
exports.MergeAllObservable = MergeAllObservable;
var MapObservable = (function (_super) {
    __extends(MapObservable, _super);
    function MapObservable(source, projection) {
        _super.call(this);
        this._projection = projection;
        this._source = source;
    }
    MapObservable.prototype._observer = function (generator) {
        var subscription = new subscription_reference_1["default"]();
        subscription.setSubscription(this._source.observer(new map_observer_1["default"](this._projection, generator, subscription)));
        return subscription.value;
    };
    return MapObservable;
})(Observable);
exports.MapObservable = MapObservable;
