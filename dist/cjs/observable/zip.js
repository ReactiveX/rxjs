'use strict';

exports.__esModule = true;
exports['default'] = zip;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var _Observer2 = require('../Observer');

var _Observer3 = _interopRequireDefault(_Observer2);

var _CompositeSubscription = require('../CompositeSubscription');

var _CompositeSubscription2 = _interopRequireDefault(_CompositeSubscription);

var _Subscription = require('../Subscription');

var _Subscription2 = _interopRequireDefault(_Subscription);

var _utilSymbol_observer = require('../util/Symbol_observer');

var _utilSymbol_observer2 = _interopRequireDefault(_utilSymbol_observer);

var _utilTryCatch = require('../util/tryCatch');

var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);

var _utilErrorObject = require('../util/errorObject');

var _utilErrorObject2 = _interopRequireDefault(_utilErrorObject);

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
            subscriptions.add(_Subscription2['default'].from(obs[_utilSymbol_observer2['default']](innerObserver), innerObserver));
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
        return { done: false };
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
        var value = (0, _utilTryCatch2['default'])(this.project).apply(this, args);
        if (value === _utilErrorObject2['default']) {
            return this.destination['throw'](_utilErrorObject2['default'].e);
        } else {
            return this.destination.next(value);
        }
    };

    return InnerZipObserver;
})(_Observer3['default']);

function zip(observables, project) {
    return new ZipObservable(observables, project);
}

module.exports = exports['default'];