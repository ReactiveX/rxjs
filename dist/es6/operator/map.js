import Subscriber from '../Subscriber';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import SubscriberFactory from '../SubscriberFactory';
class MapSubscriber extends Subscriber {
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
class MapSubscriberFactory extends SubscriberFactory {
    constructor(project) {
        super();
        this.project = project;
    }
    create(destination) {
        return new MapSubscriber(destination, this.project);
    }
}
export default function select(project) {
    return this.lift(new MapSubscriberFactory(project));
}
;
