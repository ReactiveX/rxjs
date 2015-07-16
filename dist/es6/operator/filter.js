import Subscriber from '../Subscriber';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import SubscriberFactory from '../SubscriberFactory';
class FilterSubscriber extends Subscriber {
    constructor(destination, predicate) {
        super(destination);
        this.predicate = predicate;
    }
    _next(value) {
        var result = try_catch(this.predicate).call(this, value);
        if (result === error_obj) {
            this.destination.error(error_obj.e);
        }
        else if (Boolean(result)) {
            this.destination.next(value);
        }
    }
}
class FilterSubscriberFactory extends SubscriberFactory {
    constructor(predicate) {
        super();
        this.predicate = predicate;
    }
    create(destination) {
        return new FilterSubscriber(destination, this.predicate);
    }
}
export default function select(predicate) {
    return this.lift(new FilterSubscriberFactory(predicate));
}
;
