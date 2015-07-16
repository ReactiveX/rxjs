'use strict';

exports.__esModule = true;
exports['default'] = zip;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

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

    ZipObservable.prototype.subscriber = function subscriber(_subscriber) {
        var _this = this;

        this.observables.forEach(function (obs, i) {
            var innerSubscriber = new InnerZipSubscriber(_subscriber, i, _this.project, obs);
            _subscriber.add(obs[_utilSymbol_observer2['default']](innerSubscriber));
        });
        return _subscriber;
    };

    return ZipObservable;
})(_Observable3['default']);

var InnerZipSubscriber = (function (_Subscriber) {
    function InnerZipSubscriber(destination, index, project, observable) {
        _classCallCheck(this, InnerZipSubscriber);

        _Subscriber.call(this, destination);
        this.buffer = [];
        this.index = index;
        this.project = project;
        this.observable = observable;
    }

    _inherits(InnerZipSubscriber, _Subscriber);

    InnerZipSubscriber.prototype._next = function _next(value) {
        this.buffer.push(value);
    };

    InnerZipSubscriber.prototype._canEmit = function _canEmit() {
        return this.subscriptions.every(function (subscription) {
            var sub = subscription;
            return !sub.isUnsubscribed && sub.buffer.length > 0;
        });
    };

    InnerZipSubscriber.prototype._getArgs = function _getArgs() {
        return this.subscriptions.reduce(function (args, subcription) {
            var sub = subcription;
            args.push(sub.buffer.shift());
            return args;
        }, []);
    };

    InnerZipSubscriber.prototype._checkNext = function _checkNext() {
        if (this._canEmit()) {
            var args = this._getArgs();
            return this._sendNext(args);
        }
    };

    InnerZipSubscriber.prototype._sendNext = function _sendNext(args) {
        var value = _utilTryCatch2['default'](this.project).apply(this, args);
        if (value === _utilErrorObject2['default']) {
            this.destination.error(_utilErrorObject2['default'].e);
        } else {
            this.destination.next(value);
        }
    };

    return InnerZipSubscriber;
})(_Subscriber3['default']);

function zip(observables, project) {
    return new ZipObservable(observables, project);
}

module.exports = exports['default'];