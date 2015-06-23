import Observer from '../Observer';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import Observable from '../Observable';
import Subscription from '../Subscription';
class FilterObserver extends Observer {
    constructor(destination, predicate) {
        super(destination);
        this.predicate = predicate;
    }
    _next(value) {
        var result = try_catch(this.predicate).call(this, value);
        if (result === error_obj) {
            return this.destination["throw"](error_obj.e);
        }
        else if (Boolean(result)) {
            return this.destination.next(value);
        }
    }
}
class FilterObservable extends Observable {
    constructor(source, predicate) {
        super(null);
        this.source = source;
        this.predicate = predicate;
    }
    subscriber(observer) {
        var filterObserver = new FilterObserver(observer, this.predicate);
        return Subscription.from(this.source.subscriber(filterObserver), filterObserver);
    }
}
export default function select(predicate) {
    return new FilterObservable(this, predicate);
}
;
