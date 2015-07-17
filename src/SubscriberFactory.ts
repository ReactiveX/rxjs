import Subscriber from './Subscriber';
import { Observer } from './Observer';

export default class SubscriberFactory {
  create(destination:Observer) : Subscriber {
    return new Subscriber(destination);
  }
}