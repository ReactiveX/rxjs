define(['exports', '../observer/observer', '../observer/map-observer', '../subscription/subscription-reference', '../observer/merge-all-observer', '../subscription/subscription', '../scheduler/global/current-frame', '../observer/scheduled-observer'], function (exports, _observerObserver, _observerMapObserver, _subscriptionSubscriptionReference, _observerMergeAllObserver, _subscriptionSubscription, _schedulerGlobalCurrentFrame, _observerScheduledObserver) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _Observer = _interopRequire(_observerObserver);

    var _MapObserver = _interopRequire(_observerMapObserver);

    var _SubscriptionReference = _interopRequire(_subscriptionSubscriptionReference);

    var _MergeAllObserver = _interopRequire(_observerMergeAllObserver);

    var _Subscription = _interopRequire(_subscriptionSubscription);

    var _currentFrameScheduler = _interopRequire(_schedulerGlobalCurrentFrame);

    var _ScheduledObserver = _interopRequire(_observerScheduledObserver);

    function noop() {}

    var Observable = (function () {
        function Observable(observer) {
            var scheduler = arguments[1] === undefined ? _currentFrameScheduler : arguments[1];

            _classCallCheck(this, Observable);

            this._observer = observer;
            this._scheduler = scheduler || _currentFrameScheduler;
        }

        _createClass(Observable, [{
            key: 'observer',
            value: function observer(generator) {
                var subref = new _SubscriptionReference();
                var state = {
                    source: this,
                    generator: new _Observer(generator, subref),
                    subscriptionReference: subref
                };
                this._scheduler.schedule(0, state, this.scheduledObservation);
                return state.subscriptionReference;
            }
        }, {
            key: 'scheduledObservation',
            value: function scheduledObservation(scheduler, state) {
                var result = state.source._observer(state.generator);
                var subscription;
                switch (typeof result) {
                    case 'undefined':
                        subscription = new _Subscription(noop);
                        break;
                    case 'function':
                        subscription = new _Subscription(result);
                        break;
                    default:
                        subscription = result;
                        break;
                }
                state.subscriptionReference.setSubscription(subscription);
            }
        }, {
            key: 'map',

            // Observable/Observer pair methods
            value: function map(projection) {
                return new MapObservable(this, projection);
            }
        }, {
            key: 'flatMap',
            value: function flatMap(projection) {
                return this.map(projection).mergeAll();
            }
        }, {
            key: 'mergeAll',
            value: function mergeAll() {
                return new MergeAllObservable(this);
            }
        }, {
            key: 'observeOn',
            value: function observeOn(observationScheduler) {
                return new ScheduledObservable(this, observationScheduler);
            }
        }], [{
            key: 'return',
            value: function _return(value) {
                return Observable.create(function (generator) {
                    generator.next(value);
                    generator['return']();
                });
            }
        }, {
            key: 'create',
            value: function create(observer) {
                return new Observable(observer);
            }
        }]);

        return Observable;
    })();

    exports.Observable = Observable;

    Observable['return'] = function (value) {
        return new Observable(function (generator) {
            generator.next(value);
            generator['return'](value);
        });
    };

    var ScheduledObservable = (function (_Observable) {
        function ScheduledObservable(source, observationScheduler) {
            _classCallCheck(this, ScheduledObservable);

            _get(Object.getPrototypeOf(ScheduledObservable.prototype), 'constructor', this).call(this);
            this._observationScheduler = observationScheduler;
            this._source = source;
        }

        _inherits(ScheduledObservable, _Observable);

        _createClass(ScheduledObservable, [{
            key: '_observer',
            value: function _observer(generator) {
                var subscriptionReference = new _SubscriptionReference();
                subscriptionReference.setSubscription(this._source.observer(new _ScheduledObserver(this._observationScheduler, generator, subscriptionReference)));
                return subscriptionReference.value;
            }
        }]);

        return ScheduledObservable;
    })(Observable);

    exports.ScheduledObservable = ScheduledObservable;

    var MergeAllObservable = (function (_Observable2) {
        function MergeAllObservable(source) {
            _classCallCheck(this, MergeAllObservable);

            _get(Object.getPrototypeOf(MergeAllObservable.prototype), 'constructor', this).call(this);
            this._source = source;
        }

        _inherits(MergeAllObservable, _Observable2);

        _createClass(MergeAllObservable, [{
            key: '_observer',
            value: function _observer(generator) {
                var subscriptionReference = new _SubscriptionReference();
                subscriptionReference.setSubscription(this._source.observer(new _MergeAllObserver(generator, subscriptionReference)));
                return subscriptionReference.value;
            }
        }]);

        return MergeAllObservable;
    })(Observable);

    exports.MergeAllObservable = MergeAllObservable;

    var MapObservable = (function (_Observable3) {
        function MapObservable(source, projection) {
            _classCallCheck(this, MapObservable);

            _get(Object.getPrototypeOf(MapObservable.prototype), 'constructor', this).call(this);
            this._projection = projection;
            this._source = source;
        }

        _inherits(MapObservable, _Observable3);

        _createClass(MapObservable, [{
            key: '_observer',
            value: function _observer(generator) {
                var subscriptionReference = new _SubscriptionReference();
                subscriptionReference.setSubscription(this._source.observer(new _MapObserver(this._projection, generator, subscriptionReference)));
                return subscriptionReference.value;
            }
        }]);

        return MapObservable;
    })(Observable);

    exports.MapObservable = MapObservable;
});

//# sourceMappingURL=observable.js.map