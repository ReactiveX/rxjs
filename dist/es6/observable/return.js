import Observable from '../Observable';
class ReturnObservable extends Observable {
    constructor(returnValue) {
        super(null);
        this.returnValue = returnValue;
    }
    subscriber(observer) {
        observer.return(this.returnValue);
    }
}
export default function _return(returnValue = undefined) {
    return new ReturnObservable(returnValue);
}
