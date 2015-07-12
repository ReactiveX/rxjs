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

var _ObserverFactory2 = require('../ObserverFactory');

var _ObserverFactory3 = _interopRequireDefault(_ObserverFactory2);

var MapObserver = (function (_Observer) {
    function MapObserver(destination, project) {
        _classCallCheck(this, MapObserver);

        _Observer.call(this, destination);
        this.project = project;
    }

    _inherits(MapObserver, _Observer);

    MapObserver.prototype._next = function _next(value) {
        value = _utilTryCatch2['default'](this.project).call(this, value);
        if (value === _utilErrorObject2['default']) {
            this.destination.error(_utilErrorObject2['default'].e);
        } else {
            this.destination.next(value);
        }
    };

    return MapObserver;
})(_Observer3['default']);

var MapObserverFactory = (function (_ObserverFactory) {
    function MapObserverFactory(project) {
        _classCallCheck(this, MapObserverFactory);

        _ObserverFactory.call(this);
        this.project = project;
    }

    _inherits(MapObserverFactory, _ObserverFactory);

    MapObserverFactory.prototype.create = function create(destination) {
        return new MapObserver(destination, this.project);
    };

    return MapObserverFactory;
})(_ObserverFactory3['default']);

function select(project) {
    return this.lift(new MapObserverFactory(project));
}

;
module.exports = exports['default'];