import Observable from '../Observable';
class ReturnObservable extends Observable {
    constructor(returnValue) {
        super(null);
        this.returnValue = returnValue;
    }
    subscriber(subscriber) {
        subscriber.complete(this.returnValue);
    }
}
export default function _return(returnValue = undefined) {
    return new ReturnObservable(returnValue);
}
