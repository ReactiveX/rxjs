define(['exports', 'module', '../Observable', '../util/Symbol_observer', '../SerialSubscription'], function (exports, module, _Observable2, _utilSymbol_observer, _SerialSubscription) {
    'use strict';

    module.exports = subscribeOn;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observable3 = _interopRequireDefault(_Observable2);

    var _$$observer = _interopRequireDefault(_utilSymbol_observer);

    var _SerialSubscription2 = _interopRequireDefault(_SerialSubscription);

    var SubscribeOnObservable = (function (_Observable) {
        function SubscribeOnObservable(source, scheduler) {
            _classCallCheck(this, SubscribeOnObservable);

            _Observable.call(this, null);
            this.source = source;
            this.scheduler = scheduler;
        }

        _inherits(SubscribeOnObservable, _Observable);

        SubscribeOnObservable.prototype[_$$observer['default']] = function (observer) {
            var subscription = new _SerialSubscription2['default'](null);
            var observerFn = _Observable3['default'].prototype[_$$observer['default']]; //HACK: https://github.com/Microsoft/TypeScript/issues/3573
            this.scheduler.schedule(0, [this, observer, observerFn, subscription], dispatchSubscription);
            return subscription;
        };

        return SubscribeOnObservable;
    })(_Observable3['default']);

    function dispatchSubscription(_ref) {
        var observable = _ref[0];
        var observer = _ref[1];
        var observerFn = _ref[2];
        var subscription = _ref[3];

        subscription.add(observerFn.call(observable, observer));
    }

    function subscribeOn(scheduler) {
        return new SubscribeOnObservable(this, scheduler);
    }

    ;
});