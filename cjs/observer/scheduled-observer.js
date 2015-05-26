var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var observer_1 = require('./observer');
/**
  An observer that takes a scheduler to emit values and errors on.
  @class ScheduledObserver
  @extends {Observer}
*/
var ScheduledObserver = (function (_super) {
    __extends(ScheduledObserver, _super);
    function ScheduledObserver(observationScheduler, generator, subscriptionDisposable) {
        _super.call(this, generator, subscriptionDisposable);
        this.observationScheduler = observationScheduler;
    }
    ScheduledObserver.prototype.next = function (value) {
        var _next = _super.prototype.next;
        this.observationScheduler.schedule(0, value, function (scheduler, value) {
            _next(value);
        });
        return { done: false, value: undefined };
    };
    ScheduledObserver.prototype.throw = function (value) {
        this.observationScheduler.schedule(0, value, this._throw.bind(this));
        return { done: true, value: undefined };
    };
    ScheduledObserver.prototype._throw = function (scheduler, value) {
        return _super.prototype.throw.call(this, value);
    };
    ScheduledObserver.prototype.return = function (value) {
        this.observationScheduler.schedule(0, value, this._return.bind(this));
        return { done: true, value: undefined };
    };
    ScheduledObserver.prototype._return = function (scheduler, value) {
        return _super.prototype.return.call(this, value);
    };
    return ScheduledObserver;
})(observer_1["default"]);
exports["default"] = ScheduledObserver;
