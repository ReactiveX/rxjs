define(['exports', 'module', './subscription'], function (exports, module, _subscription) {
    'use strict';

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Subscription2 = _interopRequire(_subscription);

    var SubscriptionReference = (function (_Subscription) {
        function SubscriptionReference() {
            var subscription = arguments[0] === undefined ? null : arguments[0];

            _classCallCheck(this, SubscriptionReference);

            _get(Object.getPrototypeOf(SubscriptionReference.prototype), 'constructor', this).call(this, null);
            this.isReference = true;
            this.subscription = subscription;
            this._isDisposeScheduled = false;
            this._isDisposed = false;
        }

        _inherits(SubscriptionReference, _Subscription);

        _createClass(SubscriptionReference, [{
            key: 'value',
            get: function () {
                return this.subscription;
            },
            set: function (subcription) {
                this.setSubscription(subcription);
            }
        }, {
            key: 'isDisposed',
            get: function () {
                return this._isDisposeScheduled || this._isDisposed;
            }
        }, {
            key: 'setSubscription',
            value: function setSubscription(subscription) {
                this.subscription = subscription;
                if (this._isDisposeScheduled) {
                    this._dispose();
                }
            }
        }, {
            key: '_dispose',
            value: function _dispose() {
                this.subscription.dispose();
                this._isDisposeScheduled = false;
                this._isDisposed = true;
            }
        }, {
            key: 'dispose',
            value: function dispose() {
                if (!this.subscription) {
                    this._isDisposeScheduled = true;
                } else {
                    this._dispose();
                }
            }
        }]);

        return SubscriptionReference;
    })(_Subscription2);

    module.exports = SubscriptionReference;
});

//# sourceMappingURL=subscription-reference.js.map