import Subscriber from './Subscriber';
export default class SubscriberFactory {
    create(destination) {
        return new Subscriber(destination);
    }
}
