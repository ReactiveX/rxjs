import Subscriber from './Subscriber';

export default class SubscriberFactory {
  create(destination:Subscriber) : Subscriber {
    return new Subscriber(destination);
  }
}