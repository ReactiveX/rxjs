import Subscriber from '../Subscriber';
import Observable from '../Observable';
import SubscriberFactory from '../SubscriberFactory';

class SkipSubscriber extends Subscriber {
  count:number;
  counter:number=0;
  
  constructor(destination:Subscriber, count:number) {
    super(destination);
    this.count = count;
  }
  
  _next(value:any) {
    if(this.counter++ >= this.count) {
      return this.destination.next(value);
    }
  }
}

class SkipSubscriberFactory extends SubscriberFactory {
  count:number;
  
  constructor(count:number) {
    super();
    this.count = count;
  }
  
  create(destination: Subscriber): Subscriber {
    return new SkipSubscriber(destination, this.count);
  }
}

export default function skip(count:number) : Observable {
  return this.lift(new SkipSubscriberFactory(count));
};
