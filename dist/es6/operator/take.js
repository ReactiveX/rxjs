import Subscriber from '../Subscriber';
import SubscriberFactory from '../SubscriberFactory';
class TakeSubscriber extends Subscriber {
    constructor(destination, count) {
        super(destination);
        this.counter = 0;
        this.count = count;
    }
    _next(value) {
        if (this.counter++ < this.count) {
            this.destination.next(value);
        }
        else {
            this.destination.complete();
        }
    }
}
class TakeSubscriberFactory extends SubscriberFactory {
    constructor(count) {
        super();
        this.count = count;
    }
    create(destination) {
        return new TakeSubscriber(destination, this.count);
    }
}
export default function take(count) {
    return this.lift(new TakeSubscriberFactory(count));
}
;
