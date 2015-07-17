import Subscriber from '../Subscriber';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import Observable from '../Observable';
import SubscriberFactory from '../SubscriberFactory';

class FilterSubscriber extends Subscriber {
  predicate: (x: any) => boolean;
  
  constructor(destination: Subscriber, predicate: (x: any) => boolean) {
    super(destination);
    this.predicate = predicate;
  }
  
  _next(value: any) {
    var result = try_catch(this.predicate).call(this, value);
    if(result === error_obj) {
       this.destination.error(error_obj.e);
    } else if (Boolean(result)) {
       this.destination.next(value);
    }
  }
}

class FilterSubscriberFactory extends SubscriberFactory {
  predicate: (x: any) => boolean;
  
  constructor(predicate: (x: any) => boolean) {
    super();
    this.predicate = predicate;
  }
  
  create(destination: Subscriber): Subscriber {
    return new FilterSubscriber(destination, this.predicate);
  }
}


export default function select(predicate: (x: any) => boolean) : Observable {
  return this.lift(new FilterSubscriberFactory(predicate));
};
