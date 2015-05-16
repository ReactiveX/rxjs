'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _subscriptionReference = require('./subscription-reference');

var _subscriptionReference2 = _interopRequireDefault(_subscriptionReference);

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
            if (!this._subscription) {
                this.pendingAdds = this.pendingAdds || [];
                this.pendingAdds.push(subscription);
            } else {
                this._subscription.add(subscription);
            }
        }
    }, {
        key: 'remove',
        value: function remove(subscription) {
            if (!this._subscription && this.pendingAdds) {
                this.pendingAdds.splice(this.pendingAdds.indexOf(subscription), 1);
            } else {
                this._subscription.remove(subscription);
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
            return _subscriptionReference2['default'].prototype.setSubscription.call(this, subscription);
        }
    }]);

    return CompositeSubscriptionReference;
})(_subscriptionReference2['default']);

exports['default'] = CompositeSubscriptionReference;
module.exports = exports['default'];

//# sourceMappingURL=composite-subscription-reference.js.map