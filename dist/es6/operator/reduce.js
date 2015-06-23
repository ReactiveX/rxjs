import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import Observable from '../Observable';
import Observer from '../Observer';
import Subscription from '../Subscription';
class ReduceObserver extends Observer {
    constructor(destination, processor, initialValue) {
        super(destination);
        this.processor = processor;
        this.aggregate = initialValue;
    }
    _next(value) {
        var result = try_catch(this.processor)(this.aggregate, value);
        if (result === error_obj.e) {
            this.destination.throw(error_obj.e);
        }
        else {
            this.aggregate = result;
        }
        return { done: false };
    }
    _return(value) {
        this.destination.next(this.aggregate);
        return this.destination.return(value);
    }
}
class ReduceObservable extends Observable {
    constructor(source, processor, initialValue) {
        super(null);
        this.source = source;
        this.processor = processor;
        this.initialValue = initialValue;
    }
    subscriber(observer) {
        var reduceObserver = new ReduceObserver(observer, this.processor, this.initialValue);
        return Subscription.from(this.source.subscriber(reduceObserver), reduceObserver);
    }
}
export default function reduce(processor, initialValue) {
    return new ReduceObservable(this, processor, initialValue);
}
