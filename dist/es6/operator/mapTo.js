import Subscriber from '../Subscriber';
import SubscriberFactory from '../SubscriberFactory';
class MapToSubscriber extends Subscriber {
    constructor(destination, value) {
        super(destination);
        this.value = value;
    }
    _next(_) {
        return this.destination.next(this.value);
    }
}
class MapToSubscriberFactory extends SubscriberFactory {
    constructor(value) {
        super();
        this.value = value;
    }
    create(destination) {
        return new MapToSubscriber(destination, this.value);
    }
}
export default function mapTo(value) {
    return this.lift(new MapToSubscriberFactory(value));
}
;
