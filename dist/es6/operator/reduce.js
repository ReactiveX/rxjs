import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import Observer from '../Observer';
import ObserverFactory from '../ObserverFactory';
class ReduceObserver extends Observer {
    constructor(destination, processor, initialValue) {
        super(destination);
        this.processor = processor;
        this.aggregate = initialValue;
    }
    _next(value) {
        var result = try_catch(this.processor)(this.aggregate, value);
        if (result === error_obj.e) {
            this.destination.error(error_obj.e);
        }
        else {
            this.aggregate = result;
        }
    }
    _complete(value) {
        this.destination.next(this.aggregate);
        this.destination.complete(value);
    }
}
class ReduceObserverFactory extends ObserverFactory {
    constructor(processor, initialValue) {
        super();
        this.processor = processor;
        this.initialValue = initialValue;
    }
    create(destination) {
        return new ReduceObserver(destination, this.processor, this.initialValue);
    }
}
export default function reduce(processor, initialValue) {
    return this.lift(new ReduceObserverFactory(processor, initialValue));
}
