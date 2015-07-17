'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable3 = require('./Observable');

var _Observable4 = _interopRequireDefault(_Observable3);

var _Subscriber2 = require('./Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _utilSymbol_observer = require('./util/Symbol_observer');

var _utilSymbol_observer2 = _interopRequireDefault(_utilSymbol_observer);

var ConnectableObservable = (function (_Observable) {
    function ConnectableObservable(source, subjectFactory) {
        _classCallCheck(this, ConnectableObservable);

        _Observable.call(this, null);
        this.source = source;
        this.subjectFactory = subjectFactory;
    }

    _inherits(ConnectableObservable, _Observable);

    ConnectableObservable.prototype.connect = function connect() {
        if (!this.subscription) {
            this.subscription = this.source.subscribe(this.subject);
        }
        return this.subscription;
    };

    ConnectableObservable.prototype[_utilSymbol_observer2['default']] = function (subscriber) {
        if (!(subscriber instanceof ConnectableSubscriber)) {
            subscriber = new ConnectableSubscriber(subscriber, this);
        }
        if (!this.subject || this.subject.isUnsubscribed) {
            if (this.subscription) {
                this.subscription.unsubscribe();
                this.subscription = undefined;
            }
            this.subject = this.subjectFactory();
        }
        this.subject.subscribe(subscriber);
        return subscriber;
    };

    ConnectableObservable.prototype.refCount = function refCount() {
        return new RefCountObservable(this);
    };

    return ConnectableObservable;
})(_Observable4['default']);

exports['default'] = ConnectableObservable;

var ConnectableSubscriber = (function (_Subscriber) {
    function ConnectableSubscriber(destination, source) {
        _classCallCheck(this, ConnectableSubscriber);

        _Subscriber.call(this, destination);
        this.source = source;
    }

    _inherits(ConnectableSubscriber, _Subscriber);

    ConnectableSubscriber.prototype._complete = function _complete(value) {
        this.source.subject.remove(this);
        _Subscriber.prototype._complete.call(this, value);
    };

    return ConnectableSubscriber;
})(_Subscriber3['default']);

var RefCountObservable = (function (_Observable2) {
    function RefCountObservable(source) {
        _classCallCheck(this, RefCountObservable);

        _Observable2.call(this, null);
        this.refCount = 0;
        this.source = source;
    }

    _inherits(RefCountObservable, _Observable2);

    RefCountObservable.prototype.subscriber = function subscriber(_subscriber) {
        var _this = this;

        this.refCount++;
        this.source.subscribe(_subscriber);
        var shouldConnect = this.refCount === 1;
        if (shouldConnect) {
            this.connectionSubscription = this.source.connect();
        }
        // HACK: closure, refactor soon   
        return function () {
            _this.refCount--;
            if (_this.refCount === 0) {
                _this.connectionSubscription.unsubscribe();
            }
        };
    };

    return RefCountObservable;
})(_Observable4['default']);

module.exports = exports['default'];