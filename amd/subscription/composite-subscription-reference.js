define(['exports', 'module', './subscription-reference'], function (exports, module, _subscriptionReference) {
    'use strict';

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _SubscriptionReference2 = _interopRequire(_subscriptionReference);

    var CompositeSubscriptionReference = (function (_SubscriptionReference) {
        function CompositeSubscriptionReference() {
            _classCallCheck(this, CompositeSubscriptionReference);

            if (_SubscriptionReference != null) {
                _SubscriptionReference.apply(this, arguments);
            }
        }

        _inherits(CompositeSubscriptionReference, _SubscriptionReference);

        _createClass(CompositeSubscriptionReference, [{
            key: 'add',
            value: function add(subscription) {
                if (!this.subscription) {
                    this.pendingAdds = this.pendingAdds || [];
                    this.pendingAdds.push(subscription);
                } else {
                    this.subscription.add(subscription);
                }
            }
        }, {
            key: 'remove',
            value: function remove(subscription) {
                if (!this.subscription && this.pendingAdds) {
                    this.pendingAdds.splice(this.pendingAdds.indexOf(subscription), 1);
                } else {
                    this.subscription.remove(subscription);
                }
            }
        }, {
            key: 'setSubscription',
            value: function setSubscription(subscription) {
                if (this.pendingAdds) {
                    var i, len;
                    for (i = 0, len = this.pendingAdds.length; i < len; i++) {
                        subscription.add(this.pendingAdds[i]);
                    }
                    this.pendingAdds = null;
                }
                _get(Object.getPrototypeOf(CompositeSubscriptionReference.prototype), 'setSubscription', this).call(this, subscription);
            }
        }]);

        return CompositeSubscriptionReference;
    })(_SubscriptionReference2);

    module.exports = CompositeSubscriptionReference;
});

//# sourceMappingURL=composite-subscription-reference.js.map