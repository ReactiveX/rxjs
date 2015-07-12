define(['exports', 'module', '../Observer', '../util/tryCatch', '../util/errorObject', '../ObserverFactory'], function (exports, module, _Observer2, _utilTryCatch, _utilErrorObject, _ObserverFactory2) {
    'use strict';

    module.exports = select;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observer3 = _interopRequireDefault(_Observer2);

    var _try_catch = _interopRequireDefault(_utilTryCatch);

    var _error_obj = _interopRequireDefault(_utilErrorObject);

    var _ObserverFactory3 = _interopRequireDefault(_ObserverFactory2);

    var MapObserver = (function (_Observer) {
        function MapObserver(destination, project) {
            _classCallCheck(this, MapObserver);

            _Observer.call(this, destination);
            this.project = project;
        }

        _inherits(MapObserver, _Observer);

        MapObserver.prototype._next = function _next(value) {
            value = _try_catch['default'](this.project).call(this, value);
            if (value === _error_obj['default']) {
                this.destination.error(_error_obj['default'].e);
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
});