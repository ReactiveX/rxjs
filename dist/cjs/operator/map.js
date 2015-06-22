'use strict';

exports.__esModule = true;
exports['default'] = select;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observer2 = require('../Observer');

var _Observer3 = _interopRequireDefault(_Observer2);

var _utilTryCatch = require('../util/tryCatch');

var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);

var _utilErrorObject = require('../util/errorObject');

var _utilErrorObject2 = _interopRequireDefault(_utilErrorObject);

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var _Subscription = require('../Subscription');

var _Subscription2 = _interopRequireDefault(_Subscription);

var MapObserver = (function (_Observer) {
    function MapObserver(destination, project) {
        _classCallCheck(this, MapObserver);

        _Observer.call(this, destination);
        this.project = project;
    }

    _inherits(MapObserver, _Observer);

    MapObserver.prototype._next = function _next(value) {
        value = (0, _utilTryCatch2['default'])(this.project).call(this, value);
        if (value === _utilErrorObject2['default']) {
            return this.destination['throw'](_utilErrorObject2['default'].e);
        } else {
            return this.destination.next(value);
        }
    };

    return MapObserver;
})(_Observer3['default']);

var MapObservable = (function (_Observable) {
    function MapObservable(source, project) {
        _classCallCheck(this, MapObservable);

        _Observable.call(this, null);
        this.source = source;
        this.project = project;
    }

    _inherits(MapObservable, _Observable);

    MapObservable.prototype.subscriber = function subscriber(observer) {
        var mapObserver = new MapObserver(observer, this.project);
        return _Subscription2['default'].from(this.source.subscriber(mapObserver), mapObserver);
    };

    return MapObservable;
})(_Observable3['default']);

function select(project) {
    return new MapObservable(this, project);
}

;
module.exports = exports['default'];