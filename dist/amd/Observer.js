define(["exports", "module"], function (exports, module) {
    "use strict";

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Observer = (function () {
        function Observer(destination) {
            _classCallCheck(this, Observer);

            this.unsubscribed = false;
            this.destination = destination;
        }

        Observer.create = function create(_next) {
            var _throw = arguments[1] === undefined ? null : arguments[1];

            var _return = arguments[2] === undefined ? null : arguments[2];

            var _dispose = arguments[3] === undefined ? null : arguments[3];

            var observer = new Observer(null);
            observer._next = _next;
            if (_throw) {
                observer._throw = _throw;
            }
            if (_return) {
                observer._return = _return;
            }
            if (_dispose) {
                observer._dispose = _dispose;
            }
            return observer;
        };

        Observer.prototype._dispose = function _dispose() {
            var destination = this.destination;
            if (destination && destination.dispose) {
                destination.dispose();
            }
        };

        Observer.prototype._next = function _next(value) {
            return this.destination.next(value);
        };

        Observer.prototype._throw = function _throw(error) {
            var destination = this.destination;
            if (destination && destination["throw"]) {
                return destination["throw"](error);
            } else {
                throw error;
            }
        };

        Observer.prototype._return = function _return(value) {
            var destination = this.destination;
            if (destination && destination["return"]) {
                return destination["return"](value);
            } else {
                return { done: true };
            }
        };

        Observer.prototype.next = function next(value) {
            if (this.unsubscribed) {
                return { done: true };
            }
            var result = this._next(value);
            result = result || { done: false };
            if (result.done) {
                this.unsubscribe();
            }
            return result;
        };

        Observer.prototype["throw"] = function _throw(error) {
            if (this.unsubscribed) {
                return { done: true };
            }
            var result = this._throw(error);
            this.unsubscribe();
            return { done: true, value: result ? result.value : undefined };
        };

        Observer.prototype["return"] = function _return() {
            var value = arguments[0] === undefined ? undefined : arguments[0];

            if (this.unsubscribed) {
                return { done: true };
            }
            var result = this._return(value);
            this.unsubscribe();
            return { done: true, value: result ? result.value : undefined };
        };

        Observer.prototype.unsubscribe = function unsubscribe() {
            this.unsubscribed = true;
            if (this.subscription && this.subscription._unsubscribe) {
                this.subscription._unsubscribe();
            }
        };

        Observer.prototype.setSubscription = function setSubscription(subscription) {
            this.subscription = subscription;
            if (this.unsubscribed && subscription._unsubscribe) {
                subscription._unsubscribe();
            }
        };

        Observer.prototype.dispose = function dispose() {
            if (!this.unsubscribed) {
                if (this._dispose) {
                    this._dispose();
                }
            }
            this.unsubscribe();
        };

        return Observer;
    })();

    module.exports = Observer;
});