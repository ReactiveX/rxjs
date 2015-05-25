export default class MapObserver extends Observer {
    constructor(projection, generator, subscriptionRef) {
        super(generator, subscriptionRef);
        this._projection = projection;
    }
    next(value) {
        var newValue;
        try {
            newValue = this._projection(value);
        }
        catch (err) {
            super.throw(this);
        }
        return super.next(newValue);
    }
}
//# sourceMappingURL=map-observer.js.map