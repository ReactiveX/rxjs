import Subscriber from '../Subscriber';
import error_obj from '../util/errorObject';
import Observable from '../Observable';
import SubscriberFactory from '../SubscriberFactory';

class MapToSubscriber extends Subscriber {
  value:any;
  
  constructor(destination: Subscriber, value: any) {
    super(destination);
    this.value = value;
  }
  
  _next(_: any) {
    return this.destination.next(this.value);
  }
}

class MapToSubscriberFactory extends SubscriberFactory {
  value: any;
  
  constructor(value: any) {
    super();
    this.value = value;
  }
  
  create(destination: Subscriber): Subscriber {
    return new MapToSubscriber(destination, this.value);
  }
}

export default function mapTo(value: any): Observable {
  return this.lift(new MapToSubscriberFactory(value));
};
