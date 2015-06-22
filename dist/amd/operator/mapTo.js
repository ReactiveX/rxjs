define(['exports', 'module', '../Observer', '../Observable', '../Subscription'], function (exports, module, _Observer2, _Observable2, _Subscription) {
    'use strict';

    module.exports = mapTo;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observer3 = _interopRequireDefault(_Observer2);

    var _Observable3 = _interopRequireDefault(_Observable2);

    var _Subscription2 = _interopRequireDefault(_Subscription);

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

    var MapToObservable = (function (_Observable) {
        function MapToObservable(source, value) {
            _classCallCheck(this, MapToObservable);

            _Observable.call(this, null);
            this.source = source;
            this.value = value;
        }

        _inherits(MapToObservable, _Observable);

        MapToObservable.prototype.subscriber = function subscriber(observer) {
            var mapToObserver = new MapToObserver(observer, this.value);
            return _Subscription2['default'].from(this.source.subscriber(mapToObserver), mapToObserver);
        };

        return MapToObservable;
    })(_Observable3['default']);

    function mapTo(value) {
        return new MapToObservable(this, value);
    }

    ;
});