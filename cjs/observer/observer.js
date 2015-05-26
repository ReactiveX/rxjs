var Observer = (function () {
    function Observer(generator, subscriptionDisposable) {
        this[Symbol.toStringTag] = "[object RxJS.Observer]";
        this.generator = generator;
        this.subscription = subscriptionDisposable;
    }
    Observer.prototype[Symbol.iterator] = function () {
        throw 'not implemented';
        return undefined;
    };
    Observer.prototype.next = function (value) {
        if (this.subscription.isDisposed) {
            return;
        }
        var iterationResult = this.generator.next(value);
        if (typeof iterationResult !== 'undefined' && iterationResult.done) {
            this.subscription.dispose();
        }
        return iterationResult;
    };
    Observer.prototype.throw = function (err) {
        if (this.subscription.isDisposed) {
            return;
        }
        this.subscription.dispose();
        if (this.generator.throw) {
            return this.generator.throw(err);
        }
    };
    Observer.prototype.return = function (value) {
        if (this.subscription.isDisposed) {
            return;
        }
        this.subscription.dispose();
        if (this.generator.return) {
            return this.generator.return(value);
        }
    };
    return Observer;
})();
exports["default"] = Observer;
