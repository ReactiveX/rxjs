import Observable from '../Observable';
import Subscriber from '../Subscriber';
import SubscriberFactory from '../SubscriberFactory';

class ToArraySubscriber extends Subscriber {
  array:Array<any> = [];
  
  constructor(destination:Subscriber) {
    super(destination);
  }
  
  _next(value: any) {
    this.array.push(value);
  }
  
  _complete(value: any) {
    this.destination.next(this.array);
    this.destination.complete(value);
  }
}

class ToArraySubscriberFactory extends SubscriberFactory {  
  create(destination: Subscriber): Subscriber {
    return new ToArraySubscriber(destination);
  }
}

export default function toArray(): Observable {
  return this.lift(new ToArraySubscriberFactory());
}