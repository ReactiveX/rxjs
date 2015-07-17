import Subscriber from '../Subscriber';
import SubscriberFactory from '../SubscriberFactory';
class ToArraySubscriber extends Subscriber {
    constructor(destination) {
        super(destination);
        this.array = [];
    }
    _next(value) {
        this.array.push(value);
    }
    _complete(value) {
        this.destination.next(this.array);
        this.destination.complete(value);
    }
}
class ToArraySubscriberFactory extends SubscriberFactory {
    create(destination) {
        return new ToArraySubscriber(destination);
    }
}
export default function toArray() {
    return this.lift(new ToArraySubscriberFactory());
}
