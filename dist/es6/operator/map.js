import Observer from '../Observer';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import ObserverFactory from '../ObserverFactory';
class MapObserver extends Observer {
    constructor(destination, project) {
        super(destination);
        this.project = project;
    }
    _next(value) {
        value = try_catch(this.project).call(this, value);
        if (value === error_obj) {
            this.destination.error(error_obj.e);
        }
        else {
            this.destination.next(value);
        }
    }
}
class MapObserverFactory extends ObserverFactory {
    constructor(project) {
        super();
        this.project = project;
    }
    create(destination) {
        return new MapObserver(destination, this.project);
    }
}
export default function select(project) {
    return this.lift(new MapObserverFactory(project));
}
;
