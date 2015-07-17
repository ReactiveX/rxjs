import Observable from '../Observable';
class ThrowObservable extends Observable {
    constructor(err) {
        super(null);
        this.err = err;
    }
    subscriber(subscriber) {
        subscriber.error(this.err);
    }
}
const EMPTY_THROW = new ThrowObservable(undefined);
export default function _throw(err = undefined) {
    return err ? new ThrowObservable(err) : EMPTY_THROW;
}
;
