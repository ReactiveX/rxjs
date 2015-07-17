import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import Subscriber from '../Subscriber';
import SubscriberFactory from '../SubscriberFactory';
class ReduceSubscriber extends Subscriber {
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
class ReduceSubscriberFactory extends SubscriberFactory {
    constructor(processor, initialValue) {
        super();
        this.processor = processor;
        this.initialValue = initialValue;
    }
    create(destination) {
        return new ReduceSubscriber(destination, this.processor, this.initialValue);
    }
}
export default function reduce(processor, initialValue) {
    return this.lift(new ReduceSubscriberFactory(processor, initialValue));
}
