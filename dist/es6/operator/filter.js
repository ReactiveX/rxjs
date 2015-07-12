import Observer from '../Observer';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import ObserverFactory from '../ObserverFactory';
class FilterObserver extends Observer {
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
class FilterObserverFactory extends ObserverFactory {
    constructor(predicate) {
        super();
        this.predicate = predicate;
    }
    create(destination) {
        return new FilterObserver(destination, this.predicate);
    }
}
export default function select(predicate) {
    return this.lift(new FilterObserverFactory(predicate));
}
;
