import Observer from '../Observer';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import Observable from '../Observable';
import Subscription from '../Subscription';
class MapObserver extends Observer {
    constructor(destination, project) {
        super(destination);
        this.project = project;
    }
    _next(value) {
        value = try_catch(this.project).call(this, value);
        if (value === error_obj) {
            return this.destination.throw(error_obj.e);
        }
        else {
            return this.destination.next(value);
        }
    }
}
class MapObservable extends Observable {
    constructor(source, project) {
        super(null);
        this.source = source;
        this.project = project;
    }
    subscriber(observer) {
        var mapObserver = new MapObserver(observer, this.project);
        return Subscription.from(this.source.subscriber(mapObserver), mapObserver);
    }
}
export default function select(project) {
    return new MapObservable(this, project);
}
;
