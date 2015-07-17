import Subscriber from '../Subscriber';
import Observable from '../Observable';
import SubscriberFactory from '../SubscriberFactory';

class TakeSubscriber extends Subscriber {
  count:number;
  counter:number=0;
  
  constructor(destination:Subscriber, count:number) {
    super(destination);
    this.count = count;
  }
  
  _next(value:any) {
    if(this.counter++ < this.count) {
      this.destination.next(value);
    } else {
      this.destination.complete();
    }
  }
}

class TakeSubscriberFactory extends SubscriberFactory {
  count:number;
  
  constructor(count:number) {
    super();
    this.count = count;
  }
  
  create(destination: Subscriber): Subscriber {
    return new TakeSubscriber(destination, this.count);
  }
}

export default function take(count:number) : Observable {
  return this.lift(new TakeSubscriberFactory(count));
};
