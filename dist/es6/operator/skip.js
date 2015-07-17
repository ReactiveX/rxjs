import Subscriber from '../Subscriber';
import SubscriberFactory from '../SubscriberFactory';
class SkipSubscriber extends Subscriber {
    constructor(destination, count) {
        super(destination);
        this.counter = 0;
        this.count = count;
    }
    _next(value) {
        if (this.counter++ >= this.count) {
            return this.destination.next(value);
        }
    }
}
class SkipSubscriberFactory extends SubscriberFactory {
    constructor(count) {
        super();
        this.count = count;
    }
    create(destination) {
        return new SkipSubscriber(destination, this.count);
    }
}
export default function skip(count) {
    return this.lift(new SkipSubscriberFactory(count));
}
;
