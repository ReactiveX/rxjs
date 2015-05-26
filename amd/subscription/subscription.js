define(['exports', 'module', '../util/noop'], function (exports, module, _utilNoop) {
    'use strict';

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _noop = _interopRequire(_utilNoop);

    var Subscription = (function () {
        function Subscription() {
            var action = arguments[0] === undefined ? _noop : arguments[0];

            _classCallCheck(this, Subscription);

            this.isDisposed = false;
            this._action = action;
        }

        _createClass(Subscription, [{
            key: 'dispose',
            value: function dispose() {
                if (!this.isDisposed && this._action) {
                    this._action();
                }
                this.isDisposed = true;
            }
        }]);

        return Subscription;
    })();

    module.exports = Subscription;
});

//# sourceMappingURL=subscription.js.map