import Observable from '../Observable';
import $$observer from '../util/Symbol_observer';
class ThrowObservable extends Observable {
    constructor(err) {
        super(null);
        this.err = err;
    }
    [$$observer](observer) {
        observer.error(this.err);
    }
}
const EMPTY_THROW = new ThrowObservable(undefined);
export default function _throw(err = undefined) {
    return err ? new ThrowObservable(err) : EMPTY_THROW;
}
;
