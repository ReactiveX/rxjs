'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _observer = require('./observer');

var _observer2 = _interopRequireDefault(_observer);

var _subscriptionCompositeSubscription = require('../subscription/composite-subscription');

var _subscriptionCompositeSubscription2 = _interopRequireDefault(_subscriptionCompositeSubscription);

var _subscriptionSubscriptionReference = require('../subscription/subscription-reference');

var _subscriptionSubscriptionReference2 = _interopRequireDefault(_subscriptionSubscriptionReference);

var MergeAllObserver = (function (_Observer) {
    function MergeAllObserver(generator, subscriptionRef) {
        _classCallCheck(this, MergeAllObserver);

        _get(Object.getPrototypeOf(MergeAllObserver.prototype), 'constructor', this).call(this, generator, subscriptionRef);
        this._compositeSubscription = new _subscriptionCompositeSubscription2['default']();
    }

    _inherits(MergeAllObserver, _Observer);

    _createClass(MergeAllObserver, [{
        key: 'completed',
        value: function completed(subscriptionRef) {
            this._compositeSubscription.remove(subscriptionRef);
            this.checkReturn();
        }
    }, {
        key: 'checkReturn',
        value: function checkReturn() {
            if (this.canReturn && this._compositeSubscription.length === 0) {
                var _return = this._generator['return'];
                if (_return) {
                    _return.call(this, this.returnValue);
                }
            }
        }
    }, {
        key: 'next',
        value: function next(observable) {
            var subscriptionRef = new _subscriptionSubscriptionReference2['default']();
            this._compositeSubscription.add(subscriptionRef);
            var sub;
            try {
                sub = observable.observer(new MergedObservableObserver(this, subscriptionRef));
            } catch (err) {
                _get(Object.getPrototypeOf(MergeAllObserver.prototype), 'throw', this).call(this, err);
            }
            subscriptionRef.setSubscription(sub);
        }
    }, {
        key: 'return',
        value: function _return(value) {
            this.canReturn = true;
            this.returnValue = value;
            return this.checkReturn();
        }
    }]);

    return MergeAllObserver;
})(_observer2['default']);

exports['default'] = MergeAllObserver;

var MergedObservableObserver = (function (_Observer2) {
    function MergedObservableObserver(source, subscriptionRef) {
        _classCallCheck(this, MergedObservableObserver);

        _get(Object.getPrototypeOf(MergedObservableObserver.prototype), 'constructor', this).call(this, source._generator, subscriptionRef);
        this._source = source;
    }

    _inherits(MergedObservableObserver, _Observer2);

    _createClass(MergedObservableObserver, [{
        key: 'return',
        value: function _return() {
            this._source.completed(this._subscriptionDisposable);
        }
    }]);

    return MergedObservableObserver;
})(_observer2['default']);

exports.MergedObservableObserver = MergedObservableObserver;

//# sourceMappingURL=merge-all-observer.js.map