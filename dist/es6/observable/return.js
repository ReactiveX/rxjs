import Observable from '../Observable';
import $$observer from '../util/Symbol_observer';
class ReturnObservable extends Observable {
    constructor(returnValue) {
        super(null);
        this.returnValue = returnValue;
    }
    [$$observer](observer) {
        observer.complete(this.returnValue);
    }
}
export default function _return(returnValue = undefined) {
    return new ReturnObservable(returnValue);
}
