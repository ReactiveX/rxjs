'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _subscription = require('./subscription');

var _subscription2 = _interopRequireDefault(_subscription);

var CompositeSubscription = (function (_Subscription) {
    function CompositeSubscription() {
        for (var _len = arguments.length, subscriptions = Array(_len), _key = 0; _key < _len; _key++) {
            subscriptions[_key] = arguments[_key];
        }

        _classCallCheck(this, CompositeSubscription);

        _get(Object.getPrototypeOf(CompositeSubscription.prototype), 'constructor', this).call(this);
        this._subscriptions = subscriptions;
    }

    _inherits(CompositeSubscription, _Subscription);

    _createClass(CompositeSubscription, [{
        key: 'add',
        value: function add(subscription) {
            this._subscriptions.push(subscription);
            return this;
        }
    }, {
        key: 'remove',
        value: function remove(subscription) {
            this._subscriptions.splice(this._subscriptions.indexOf(subscription), 1);
            return this;
        }
    }, {
        key: 'length',
        get: function () {
            return this._subscriptions.length;
        }
    }, {
        key: 'dispose',
        value: function dispose() {
            while (this._subscriptions.length > 1) {
                var subcription = this._subscriptions.pop();
                subcription.dispose();
            }
            return _subscription2['default'].prototype.dispose.call(this);
        }
    }]);

    return CompositeSubscription;
})(_subscription2['default']);

exports['default'] = CompositeSubscription;
module.exports = exports['default'];

//# sourceMappingURL=composite-subscription.js.map