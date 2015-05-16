var Observer = (function () {
    function Observer(generator, subscriptionDisposable) {
        this._generator = generator;
        this._subscriptionDisposable = subscriptionDisposable;
    }
    Observer.prototype.next = function (value) {
        if (this._subscriptionDisposable.isDisposed) {
            return;
        }
        var iterationResult = this._generator.next(value);
        if (typeof iterationResult !== 'undefined' && iterationResult.done) {
            this._subscriptionDisposable.dispose();
        }
        return iterationResult;
    };
    Observer.prototype.throw = function (err) {
        if (this._subscriptionDisposable.isDisposed) {
            return;
        }
        this._subscriptionDisposable.dispose();
        if (this._generator.throw) {
            return this._generator.throw(err);
        }
    };
    Observer.prototype.return = function (value) {
        if (this._subscriptionDisposable.isDisposed) {
            return;
        }
        this._subscriptionDisposable.dispose();
        if (this._generator.return) {
            return this._generator.return(value);
        }
    };
    return Observer;
})();
exports.default = Observer;
