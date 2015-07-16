define(['exports', 'module', './util/Symbol_observer', './SubscriberFactory', './Subscriber'], function (exports, module, _utilSymbol_observer, _SubscriberFactory, _Subscriber) {
    'use strict';

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _$$observer = _interopRequireDefault(_utilSymbol_observer);

    var _SubscriberFactory2 = _interopRequireDefault(_SubscriberFactory);

    var _Subscriber2 = _interopRequireDefault(_Subscriber);

    var Observable = (function () {
        function Observable() {
            var subscriber = arguments[0] === undefined ? null : arguments[0];

            _classCallCheck(this, Observable);

            this.source = null;
            this.subscriberFactory = new _SubscriberFactory2['default']();
            if (subscriber) {
                this.subscriber = subscriber;
            }
            this.source = this;
        }

        Observable.create = function create(subscriber) {
            return new Observable(subscriber);
        };

        Observable.prototype.subscriber = function subscriber(_subscriber) {
            return this.source.subscribe(this.subscriberFactory.create(_subscriber));
        };

        Observable.prototype.lift = function lift(subscriberFactory) {
            var observable = new Observable();
            observable.source = this;
            observable.subscriberFactory = subscriberFactory;
            return observable;
        };

        Observable.prototype[_$$observer['default']] = function (observer) {
            var subscriber = new _Subscriber2['default'](observer);
            this.subscriber(subscriber);
        };

        Observable.prototype.subscribe = function subscribe(observerOrNext) {
            var error = arguments[1] === undefined ? null : arguments[1];
            var complete = arguments[2] === undefined ? null : arguments[2];

            var observer = undefined;
            if (typeof observerOrNext === 'object') {
                observer = observerOrNext;
            } else {
                observer = {
                    next: observerOrNext,
                    error: error,
                    complete: complete
                };
            }
            return this[_$$observer['default']](observer);
        };

        Observable.prototype.forEach = function forEach(nextHandler) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                var observer = {
                    next: nextHandler,
                    error: function error(err) {
                        reject(err);
                    },
                    complete: function complete(value) {
                        resolve(value);
                    }
                };
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