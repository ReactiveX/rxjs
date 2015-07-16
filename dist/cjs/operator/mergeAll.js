'use strict';

exports.__esModule = true;
exports['default'] = mergeAll;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Subscriber3 = require('../Subscriber');

var _Subscriber4 = _interopRequireDefault(_Subscriber3);

var _utilSymbol_observer = require('../util/Symbol_observer');

var _utilSymbol_observer2 = _interopRequireDefault(_utilSymbol_observer);

var _SubscriberFactory2 = require('../SubscriberFactory');

var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

var MergeAllSubscriber = (function (_Subscriber) {
    function MergeAllSubscriber(destination, concurrent) {
        _classCallCheck(this, MergeAllSubscriber);

        _Subscriber.call(this, destination);
        this.stopped = false;
        this.buffer = [];
        this.concurrent = concurrent;
    }

    _inherits(MergeAllSubscriber, _Subscriber);

    MergeAllSubscriber.prototype.next = function next(observable) {
        var buffer = this.buffer;
        var concurrent = this.concurrent;
        var subscriptions = this.subscriptions;
        if (subscriptions.length < concurrent) {
            var innerSubscriber = new MergeInnerSubscriber(this);
            this.add(innerSubscriber);
            innerSubscriber.add(observable[_utilSymbol_observer2['default']](innerSubscriber));
        } else if (buffer) {
            buffer.push(observable);
        }
    };

    MergeAllSubscriber.prototype.complete = function complete(value) {
        this.stopped = true;
        if (this.subscriptions.length === 0 && (this.buffer && this.buffer.length === 0)) {
            this.destination.complete(value);
        }
    };

    MergeAllSubscriber.prototype._innerComplete = function _innerComplete(innerSubscriber) {
        var buffer = this.buffer;
        this.remove(innerSubscriber);
        if (this.subscriptions.length < this.concurrent) {
            if (buffer && buffer.length > 0) {
                this.next(buffer.shift());
            } else if (this.stopped && this.subscriptions.length === 0) {
                return this.destination.complete();
            }
        }
    };

    return MergeAllSubscriber;
})(_Subscriber4['default']);

var MergeInnerSubscriber = (function (_Subscriber2) {
    function MergeInnerSubscriber(parent) {
        _classCallCheck(this, MergeInnerSubscriber);

        _Subscriber2.call(this, parent.destination);
        this.parent = parent;
    }

    _inherits(MergeInnerSubscriber, _Subscriber2);

    MergeInnerSubscriber.prototype._complete = function _complete(value) {
        return this.parent._innerComplete(this);
    };

    return MergeInnerSubscriber;
})(_Subscriber4['default']);

var MergeAllSubscriberFactory = (function (_SubscriberFactory) {
    function MergeAllSubscriberFactory(concurrent) {
        _classCallCheck(this, MergeAllSubscriberFactory);

        _SubscriberFactory.call(this);
        this.concurrent = concurrent;
    }

    _inherits(MergeAllSubscriberFactory, _SubscriberFactory);

    MergeAllSubscriberFactory.prototype.create = function create(destination) {
        return new MergeAllSubscriber(destination, this.concurrent);
    };

    return MergeAllSubscriberFactory;
})(_SubscriberFactory3['default']);

function mergeAll() {
    var concurrent = arguments[0] === undefined ? Number.POSITIVE_INFINITY : arguments[0];

    return this.lift(new MergeAllSubscriberFactory(concurrent));
}

;
module.exports = exports['default'];