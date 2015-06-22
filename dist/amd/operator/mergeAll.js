define(['exports', 'module', '../Observer', '../Subscription', '../SerialSubscription', '../CompositeSubscription', '../Observable', '../util/Symbol_observer'], function (exports, module, _Observer3, _Subscription, _SerialSubscription, _CompositeSubscription, _Observable2, _utilSymbol_observer) {
    'use strict';

    module.exports = mergeAll;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observer4 = _interopRequireDefault(_Observer3);

    var _Subscription2 = _interopRequireDefault(_Subscription);

    var _SerialSubscription2 = _interopRequireDefault(_SerialSubscription);

    var _CompositeSubscription2 = _interopRequireDefault(_CompositeSubscription);

    var _Observable3 = _interopRequireDefault(_Observable2);

    var _$$observer = _interopRequireDefault(_utilSymbol_observer);

    var MergeAllObserver = (function (_Observer) {
        function MergeAllObserver(destination, concurrent) {
            _classCallCheck(this, MergeAllObserver);

            _Observer.call(this, destination);
            this.stopped = false;
            this.buffer = [];
            this.concurrent = concurrent;
            this.subscriptions = new _CompositeSubscription2['default']();
        }

        _inherits(MergeAllObserver, _Observer);

        MergeAllObserver.prototype.next = function next(observable) {
            var buffer = this.buffer;
            var concurrent = this.concurrent;
            var subscriptions = this.subscriptions;
            if (subscriptions.length < concurrent) {
                var innerSubscription = new _SerialSubscription2['default'](null);
                var innerObserver = new MergeInnerObserver(this, innerSubscription);
                subscriptions.add(innerSubscription);
                innerSubscription.add(observable[_$$observer['default']](innerObserver));
            } else if (buffer) {
                buffer.push(observable);
            }
            return { done: false };
        };

        MergeAllObserver.prototype['return'] = function _return() {
            this.stopped = true;
            if (this.subscriptions.length === 0 && (this.buffer && this.buffer.length === 0)) {
                this.destination['return']();
            }
            return { done: true };
        };

        MergeAllObserver.prototype._innerReturn = function _innerReturn(innerObserver) {
            var buffer = this.buffer;
            var subscriptions = this.subscriptions;
            subscriptions.remove(innerObserver.subscription);
            if (subscriptions.length < this.concurrent) {
                if (buffer && buffer.length > 0) {
                    this.next(buffer.shift());
                } else if (this.stopped && subscriptions.length === 0) {
                    return this.destination['return']();
                }
            }
            return { done: true };
        };

        MergeAllObserver.prototype._dispose = function _dispose() {
            console.log('dispose parent');
            this.subscriptions.unsubscribe();
        };

        return MergeAllObserver;
    })(_Observer4['default']);

    var MergeInnerObserver = (function (_Observer2) {
        function MergeInnerObserver(parent, subscription) {
            _classCallCheck(this, MergeInnerObserver);

            _Observer2.call(this, parent.destination);
            this.parent = parent;
            this.subscription = subscription;
        }

        _inherits(MergeInnerObserver, _Observer2);

        MergeInnerObserver.prototype._return = function _return() {
            return this.parent._innerReturn(this);
        };

        return MergeInnerObserver;
    })(_Observer4['default']);

    var MergeAllObservable = (function (_Observable) {
        function MergeAllObservable(source, concurrent) {
            _classCallCheck(this, MergeAllObservable);

            _Observable.call(this, null);
            this.source = source;
            this.concurrent = concurrent;
        }

        _inherits(MergeAllObservable, _Observable);

        MergeAllObservable.prototype.subscriber = function subscriber(observer) {
            var mergeAllObserver = new MergeAllObserver(observer, this.concurrent);
            return _Subscription2['default'].from(this.source.subscriber(mergeAllObserver), mergeAllObserver);
        };

        return MergeAllObservable;
    })(_Observable3['default']);

    function mergeAll() {
        var concurrent = arguments[0] === undefined ? Number.POSITIVE_INFINITY : arguments[0];

        return new MergeAllObservable(this, concurrent);
    }

    ;
});