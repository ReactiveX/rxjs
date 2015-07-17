define(['exports', 'module', '../Subscriber', '../util/tryCatch', '../util/errorObject', '../SubscriberFactory'], function (exports, module, _Subscriber2, _utilTryCatch, _utilErrorObject, _SubscriberFactory2) {
    'use strict';

    module.exports = select;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Subscriber3 = _interopRequireDefault(_Subscriber2);

    var _try_catch = _interopRequireDefault(_utilTryCatch);

    var _error_obj = _interopRequireDefault(_utilErrorObject);

    var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

    var MapSubscriber = (function (_Subscriber) {
        function MapSubscriber(destination, project) {
            _classCallCheck(this, MapSubscriber);

            _Subscriber.call(this, destination);
            this.project = project;
        }

        _inherits(MapSubscriber, _Subscriber);

        MapSubscriber.prototype._next = function _next(value) {
            value = _try_catch['default'](this.project).call(this, value);
            if (value === _error_obj['default']) {
                this.destination.error(_error_obj['default'].e);
            } else {
                this.destination.next(value);
            }
        };

        return MapSubscriber;
    })(_Subscriber3['default']);

    var MapSubscriberFactory = (function (_SubscriberFactory) {
        function MapSubscriberFactory(project) {
            _classCallCheck(this, MapSubscriberFactory);

            _SubscriberFactory.call(this);
            this.project = project;
        }

        _inherits(MapSubscriberFactory, _SubscriberFactory);

        MapSubscriberFactory.prototype.create = function create(destination) {
            return new MapSubscriber(destination, this.project);
        };

        return MapSubscriberFactory;
    })(_SubscriberFactory3['default']);

    function select(project) {
        return this.lift(new MapSubscriberFactory(project));
    }

    ;
});