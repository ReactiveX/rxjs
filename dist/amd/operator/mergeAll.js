define(['exports', 'module', '../Observer', '../SerialSubscription', '../CompositeSubscription', '../util/Symbol_observer', '../ObserverFactory'], function (exports, module, _Observer3, _SerialSubscription, _CompositeSubscription, _utilSymbol_observer, _ObserverFactory2) {
    'use strict';

    module.exports = mergeAll;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observer4 = _interopRequireDefault(_Observer3);

    var _SerialSubscription2 = _interopRequireDefault(_SerialSubscription);

    var _CompositeSubscription2 = _interopRequireDefault(_CompositeSubscription);

    var _$$observer = _interopRequireDefault(_utilSymbol_observer);

    var _ObserverFactory3 = _interopRequireDefault(_ObserverFactory2);

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
        };

        MergeAllObserver.prototype.complete = function complete(value) {
            this.stopped = true;
            if (this.subscriptions.length === 0 && (this.buffer && this.buffer.length === 0)) {
                this.destination.complete(value);
            }
        };

        MergeAllObserver.prototype._innerComplete = function _innerComplete(innerObserver) {
            var buffer = this.buffer;
            var subscriptions = this.subscriptions;
            subscriptions.remove(innerObserver.subscription);
            if (subscriptions.length < this.concurrent) {
                if (buffer && buffer.length > 0) {
                    this.next(buffer.shift());
                } else if (this.stopped && subscriptions.length === 0) {
                    return this.destination.complete();
                }
            }
        };

        MergeAllObserver.prototype.unsubscribe = function unsubscribe() {
            _Observer.prototype.unsubscribe.call(this);
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

        MergeInnerObserver.prototype._complete = function _complete(value) {
            return this.parent._innerComplete(this);
        };

        return MergeInnerObserver;
    })(_Observer4['default']);

    var MergeAllObserverFactory = (function (_ObserverFactory) {
        function MergeAllObserverFactory(concurrent) {
            _classCallCheck(this, MergeAllObserverFactory);

            _ObserverFactory.call(this);
            this.concurrent = concurrent;
        }

        _inherits(MergeAllObserverFactory, _ObserverFactory);

        MergeAllObserverFactory.prototype.create = function create(destination) {
            return new MergeAllObserver(destination, this.concurrent);
        };

        return MergeAllObserverFactory;
    })(_ObserverFactory3['default']);

    function mergeAll() {
        var concurrent = arguments[0] === undefined ? Number.POSITIVE_INFINITY : arguments[0];

        return this.lift(new MergeAllObserverFactory(concurrent));
    }

    ;
});