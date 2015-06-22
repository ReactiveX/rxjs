define(['exports', 'module', './Observer', './Subscription', './SerialSubscription', './scheduler/nextTick', './util/Symbol_observer'], function (exports, module, _Observer, _Subscription, _SerialSubscription, _schedulerNextTick, _utilSymbol_observer) {
    'use strict';

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _Observer2 = _interopRequireDefault(_Observer);

    var _Subscription2 = _interopRequireDefault(_Subscription);

    var _SerialSubscription2 = _interopRequireDefault(_SerialSubscription);

    var _nextTick = _interopRequireDefault(_schedulerNextTick);

    var _$$observer = _interopRequireDefault(_utilSymbol_observer);

    var Observable = (function () {
        function Observable(subscriber) {
            _classCallCheck(this, Observable);

            if (subscriber) {
                this.subscriber = subscriber;
            }
        }

        Observable.create = function create(subscriber) {
            return new Observable(subscriber);
        };

        Observable.prototype.subscriber = function subscriber(observer) {
            return void 0;
        };

        Observable.prototype[_$$observer['default']] = function (observer) {
            return _Subscription2['default'].from(this.subscriber(observer), observer);
        };

        Observable.prototype.subscribe = function subscribe(observerOrNextHandler) {
            var throwHandler = arguments[1] === undefined ? null : arguments[1];
            var returnHandler = arguments[2] === undefined ? null : arguments[2];
            var disposeHandler = arguments[3] === undefined ? null : arguments[3];

            var observer;
            if (typeof observerOrNextHandler === 'object') {
                observer = observerOrNextHandler;
            } else {
                observer = _Observer2['default'].create(observerOrNextHandler, throwHandler, returnHandler, disposeHandler);
            }
            var subscription = new _SerialSubscription2['default'](null);
            subscription.observer = observer;
            subscription.add(_nextTick['default'].schedule(0, [observer, this], dispatchSubscription));
            return subscription;
        };

        Observable.prototype.forEach = function forEach(nextHandler) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                var observer = _Observer2['default'].create(function (value) {
                    nextHandler(value);
                    return { done: false };
                }, function (err) {
                    reject(err);
                    return { done: true };
                }, function (value) {
                    resolve(value);
                    return { done: true };
                });
                _this[_$$observer['default']](observer);
            });
        };

        return Observable;
    })();

    module.exports = Observable;

    function dispatchSubscription(_ref) {
        var observer = _ref[0];
        var observable = _ref[1];

        return observable[_$$observer['default']](observer);
    }
});