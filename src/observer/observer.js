export default class Observer {
    constructor(generator, subscriptionDisposable) {
        this[Symbol.toStringTag] = "[object RxJS.Observer]";
        this.generator = generator;
        this.subscription = subscriptionDisposable;
    }
    [Symbol.iterator]() {
        throw 'not implemented';
        return undefined;
    }
    next(value) {
        if (this.subscription.isDisposed) {
            return;
        }
        var iterationResult = this.generator.next(value);
        if (typeof iterationResult !== 'undefined' && iterationResult.done) {
            this.subscription.dispose();
        }
        return iterationResult;
    }
    throw(err) {
        if (this.subscription.isDisposed) {
            return;
        }
        this.subscription.dispose();
        if (this.generator.throw) {
            return this.generator.throw(err);
        }
    }
    return(value) {
        if (this.subscription.isDisposed) {
            return;
        }
        this.subscription.dispose();
        if (this.generator.return) {
            return this.generator.return(value);
        }
    }
}
//# sourceMappingURL=observer.js.map