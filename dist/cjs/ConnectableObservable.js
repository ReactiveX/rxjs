'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable3 = require('./Observable');

var _Observable4 = _interopRequireDefault(_Observable3);

var _Observer = require('./Observer');

var _Observer2 = _interopRequireDefault(_Observer);

var _utilSymbol_observer = require('./util/Symbol_observer');

var _utilSymbol_observer2 = _interopRequireDefault(_utilSymbol_observer);

var _schedulerNextTick = require('./scheduler/nextTick');

var _schedulerNextTick2 = _interopRequireDefault(_schedulerNextTick);

var ConnectableObservable = (function (_Observable) {
    function ConnectableObservable(source, subjectFactory) {
        _classCallCheck(this, ConnectableObservable);

        _Observable.call(this, null);
        this.source = source;
        this.subjectFactory = subjectFactory;
    }

    _inherits(ConnectableObservable, _Observable);

    ConnectableObservable.prototype.connect = function connect() {
        return _schedulerNextTick2['default'].schedule(0, this, dispatchConnection);
    };

    ConnectableObservable.prototype.connectSync = function connectSync() {
        return dispatchConnection(this);
    };

    ConnectableObservable.prototype[_utilSymbol_observer2['default']] = function (observer) {
        if (!(observer instanceof _Observer2['default'])) {
            observer = new _Observer2['default'](observer);
        }
        if (!this.subject || this.subject.unsubscribed) {
            if (this.subscription) {
                this.subscription = undefined;
            }
            this.subject = this.subjectFactory();
        }
        return this.subject[_utilSymbol_observer2['default']](observer);
    };

    ConnectableObservable.prototype.refCount = function refCount() {
        return new RefCountObservable(this);
    };

    return ConnectableObservable;
})(_Observable4['default']);

exports['default'] = ConnectableObservable;

var RefCountObservable = (function (_Observable2) {
    function RefCountObservable(source) {
        _classCallCheck(this, RefCountObservable);

        _Observable2.call(this, null);
        this.refCount = 0;
        this.source = source;
    }

    _inherits(RefCountObservable, _Observable2);

    RefCountObservable.prototype.subscriber = function subscriber(observer) {
        var _this = this;

        this.refCount++;
        this.source[_utilSymbol_observer2['default']](observer);
        var shouldConnect = this.refCount === 1;
        if (shouldConnect) {
            this.connectionSubscription = this.source.connectSync();
        }
        return function () {
            var refCount = _this.refCount--;
            if (refCount === 0) {
                _this.connectionSubscription.unsubscribe();
            }
        };
    };

    return RefCountObservable;
})(_Observable4['default']);

function dispatchConnection(connectable) {
    if (!connectable.subscription) {
        if (!connectable.subject) {
            connectable.subject = connectable.subjectFactory();
        }
        connectable.subscription = connectable.source.subscribe(connectable.subject);
    }
    return connectable.subscription;
}
module.exports = exports['default'];