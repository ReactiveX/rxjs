define(['exports', 'module'], function (exports, module) {
    'use strict';

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var Subscriber = (function () {
        function Subscriber(destination) {
            _classCallCheck(this, Subscriber);

            this.isUnsubscribed = false;
            this.subscriptions = [];
            this.destination = destination;
        }

        Subscriber.prototype.next = function next(value) {
            if (!this.isUnsubscribed) {
                this._next(value);
            }
        };

        Subscriber.prototype._next = function _next(value) {
            if (this.destination) {
                this.destination.next(value);
            }
        };

        Subscriber.prototype.error = function error(err) {
            if (!this.isUnsubscribed) {
                this._error(err);
                this.unsubscribe();
            }
        };

        Subscriber.prototype._error = function _error(err) {
            var destination = this.destination;
            if (destination && destination.error) {
                destination.error(err);
            } else {
                throw err;
            }
        };

        Subscriber.prototype.complete = function complete() {
            var value = arguments[0] === undefined ? undefined : arguments[0];

            if (!this.isUnsubscribed) {
                this._complete(value);
                this.unsubscribe();
            }
        };

        Subscriber.prototype._complete = function _complete(value) {
            var destination = this.destination;
            if (destination && destination.complete) {
                destination.complete(value);
            }
        };

        Subscriber.prototype.subscribe = function subscribe(subscription) {
            this._subscribe(subscription);
        };

        Subscriber.prototype._subscribe = function _subscribe(subscription) {
            var destination = this.destination;
            if (destination && destination.subscribe) {
                destination.subscribe(subscription);
            }
        };

        Subscriber.prototype.unsubscribe = function unsubscribe() {
            this.isUnsubscribed = true;
            while (this.subscriptions.length > 0) {
                var sub = this.subscriptions.shift();
                sub.unsubscribe();
            }
        };

        Subscriber.prototype.add = function add(subscriptionOrAction) {
            if (!subscriptionOrAction) {
                return;
            }
            var subscription = typeof subscriptionOrAction === 'function' ? { unsubscribe: subscriptionOrAction } : subscriptionOrAction;
            if (this.isUnsubscribed) {
                subscription.unsubscribe();
            } else if (typeof subscription.unsubscribe === 'function') {
                this.subscriptions.push(subscription);
            }
        };

        Subscriber.prototype.remove = function remove(subscription) {
            var index = this.subscriptions.indexOf(subscription);
            if (index !== -1) {
                this.subscriptions.splice(index, 1);
            }
        };

        return Subscriber;
    })();

    module.exports = Subscriber;
});