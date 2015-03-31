import Observable from '../Observable';

class DeferObservable extends Observable {
    constructor(observableFactory) {
        this.factory = observableFactory;
        super(subscribe);
    }
}

function subscribe(s) {
    this.factory().subscribe(n, e, c);
}

export default (observableFactory) => {
    return new DeferObservable(observableFactory);
};