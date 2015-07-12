"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Observer = (function () {
    function Observer(destination) {
        _classCallCheck(this, Observer);

        this.unsubscribed = false;
        this.destination = destination;
    }

    Observer.create = function create(_next) {
        var _error = arguments[1] === undefined ? null : arguments[1];

        var _completed = arguments[2] === undefined ? null : arguments[2];

        var observer = new Observer(null);
        observer._next = _next;
        if (_error) {
            observer._error = _error;
        }
        if (_completed) {
            observer._completed = _completed;
        }
        return observer;
    };

    Observer.prototype._next = function _next(value) {
        this.destination.next(value);
    };

    Observer.prototype._error = function _error(error) {
        var destination = this.destination;
        if (destination && destination.error) {
            destination.error(error);
        } else {
            throw error;
        }
    };

    Observer.prototype._completed = function _completed(value) {
        var destination = this.destination;
        if (destination && destination.complete) {
            destination.complete(value);
        }
    };

    Observer.prototype.next = function next(value) {
        if (this.unsubscribed) {
            return;
        }
        this._next(value);
    };

    Observer.prototype.error = function error(_error2) {
        if (this.unsubscribed) {
            return;
        }
        var result = this._error(_error2);
        this.unsubscribe();
    };

    Observer.prototype.complete = function complete() {
        var value = arguments[0] === undefined ? undefined : arguments[0];

        if (this.unsubscribed) {
            return;
        }
        var result = this._completed(value);
        this.unsubscribe();
    };

    Observer.prototype.unsubscribe = function unsubscribe() {
        this.unsubscribed = true;
    };

    return Observer;
})();

exports["default"] = Observer;
module.exports = exports["default"];