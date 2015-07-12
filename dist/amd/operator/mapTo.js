define(['exports', 'module', '../Observer', '../ObserverFactory'], function (exports, module, _Observer2, _ObserverFactory2) {
    'use strict';

    module.exports = mapTo;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observer3 = _interopRequireDefault(_Observer2);

    var _ObserverFactory3 = _interopRequireDefault(_ObserverFactory2);

    var MapToObserver = (function (_Observer) {
        function MapToObserver(destination, value) {
            _classCallCheck(this, MapToObserver);

            _Observer.call(this, destination);
            this.value = value;
        }

        _inherits(MapToObserver, _Observer);

        MapToObserver.prototype._next = function _next(_) {
            return this.destination.next(this.value);
        };

        return MapToObserver;
    })(_Observer3['default']);

    var MapToObserverFactory = (function (_ObserverFactory) {
        function MapToObserverFactory(value) {
            _classCallCheck(this, MapToObserverFactory);

            _ObserverFactory.call(this);
            this.value = value;
        }

        _inherits(MapToObserverFactory, _ObserverFactory);

        MapToObserverFactory.prototype.create = function create(destination) {
            return new MapToObserver(destination, this.value);
        };

        return MapToObserverFactory;
    })(_ObserverFactory3['default']);

    function mapTo(value) {
        return this.lift(new MapToObserverFactory(value));
    }

    ;
});