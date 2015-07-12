define(['exports', 'module', '../Observable', '../Observer', '../CompositeSubscription', '../Subscription', '../util/Symbol_observer', '../util/tryCatch', '../util/errorObject'], function (exports, module, _Observable2, _Observer2, _CompositeSubscription, _Subscription, _utilSymbol_observer, _utilTryCatch, _utilErrorObject) {
    'use strict';

    module.exports = zip;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observable3 = _interopRequireDefault(_Observable2);

    var _Observer3 = _interopRequireDefault(_Observer2);

    var _CompositeSubscription2 = _interopRequireDefault(_CompositeSubscription);

    var _Subscription2 = _interopRequireDefault(_Subscription);

    var _$$observer = _interopRequireDefault(_utilSymbol_observer);

    var _try_catch = _interopRequireDefault(_utilTryCatch);

    var _error_obj = _interopRequireDefault(_utilErrorObject);

    var ZipObservable = (function (_Observable) {
        function ZipObservable(observables, project) {
            _classCallCheck(this, ZipObservable);

            _Observable.call(this, null);
            this.observables = observables;
            this.project = project;
        }

        _inherits(ZipObservable, _Observable);

        ZipObservable.prototype.subscriber = function subscriber(observer) {
            var _this = this;

            var subscriptions = new _CompositeSubscription2['default']();
            this.observables.forEach(function (obs, i) {
                var innerObserver = new InnerZipObserver(observer, i, _this.project, subscriptions, obs);
                subscriptions.add(_Subscription2['default'].from(obs[_$$observer['default']](innerObserver), innerObserver));
            });
            return subscriptions;
        };

        return ZipObservable;
    })(_Observable3['default']);

    var InnerZipObserver = (function (_Observer) {
        function InnerZipObserver(destination, index, project, subscriptions, observable) {
            _classCallCheck(this, InnerZipObserver);

            _Observer.call(this, destination);
            this.buffer = [];
            this.index = index;
            this.project = project;
            this.subscriptions = subscriptions;
            this.observable = observable;
        }

        _inherits(InnerZipObserver, _Observer);

        InnerZipObserver.prototype._next = function _next(value) {
            this.buffer.push(value);
        };

        InnerZipObserver.prototype._canEmit = function _canEmit() {
            return this.subscriptions._subscriptions.every(function (sub) {
                var observer = sub.observer;
                return !observer.unsubscribed && observer.buffer.length > 0;
            });
        };

        InnerZipObserver.prototype._getArgs = function _getArgs() {
            return this.subscriptions._subscriptions.reduce(function (args, sub) {
                var observer = sub.observer;
                args.push(observer.buffer.shift());
                return args;
            }, []);
        };

        InnerZipObserver.prototype._checkNext = function _checkNext() {
            if (this._canEmit()) {
                var args = this._getArgs();
                return this._sendNext(args);
            }
        };

        InnerZipObserver.prototype._sendNext = function _sendNext(args) {
            var value = _try_catch['default'](this.project).apply(this, args);
            if (value === _error_obj['default']) {
                this.destination.error(_error_obj['default'].e);
            } else {
                this.destination.next(value);
            }
        };

        return InnerZipObserver;
    })(_Observer3['default']);

    function zip(observables, project) {
        return new ZipObservable(observables, project);
    }
});