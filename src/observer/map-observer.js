var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var observer_1 = require('./observer');
var MapObserver = (function (_super) {
    __extends(MapObserver, _super);
    function MapObserver(projection, generator, subscriptionRef) {
        _super.call(this, generator, subscriptionRef);
        this._projection = projection;
    }
    MapObserver.prototype.next = function (value) {
        var newValue;
        try {
            newValue = this._projection(value);
        }
        catch (err) {
            _super.prototype.throw.call(this, this);
        }
        return _super.prototype.next.call(this, newValue);
    };
    return MapObserver;
})(observer_1.default);
exports.default = MapObserver;
