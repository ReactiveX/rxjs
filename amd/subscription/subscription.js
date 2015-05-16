define(["exports", "module"], function (exports, module) {
    "use strict";

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Subscription = (function () {
        function Subscription(action) {
            _classCallCheck(this, Subscription);

            this.isDisposed = false;
            this._action = action;
        }

        _createClass(Subscription, [{
            key: "dispose",
            value: function dispose() {
                if (!this.isDisposed && this._action) {
                    this._action();
                }
                this.isDisposed = true;
            }
        }, {
            key: "child",
            value: function child(action) {
                var ChildSubscription = function ChildSubscription(action) {
                    this._action = action;
                };
                ChildSubscription.prototype = this;
                return new ChildSubscription(action);
            }
        }]);

        return Subscription;
    })();

    module.exports = Subscription;
});

//# sourceMappingURL=subscription.js.map