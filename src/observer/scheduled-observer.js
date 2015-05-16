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
        this._observationScheduler = observationScheduler;
    }
    ScheduledObserver.prototype.next = function (value) {
        this._observationScheduler.schedule(0, value, this._next.bind(this));
    };
    ScheduledObserver.prototype._next = function (scheduler, value) {
        _super.prototype.next.call(this, value);
    };
    ScheduledObserver.prototype.throw = function (value) {
        this._observationScheduler.schedule(0, value, this._throw.bind(this));
    };
    ScheduledObserver.prototype._throw = function (scheduler, value) {
        _super.prototype.throw.call(this, value);
    };
    ScheduledObserver.prototype.return = function (value) {
        this._observationScheduler.schedule(0, value, this._return.bind(this));
    };
    ScheduledObserver.prototype._return = function (scheduler, value) {
        _super.prototype.return.call(this, value);
    };
    return ScheduledObserver;
})(observer_1.default);
exports.default = ScheduledObserver;
