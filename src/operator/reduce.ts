import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import SubscriberFactory from '../SubscriberFactory';

class ReduceSubscriber extends Subscriber {
  processor: (accum: any, value: any) => any;
  aggregate: any;
  
  constructor(destination: Subscriber, processor: (accum: any, value: any) => any, initialValue: any) {
    super(destination);
    this.processor = processor;
    this.aggregate = initialValue;
  }
  
  _next(value: any) {
    var result = try_catch(this.processor)(this.aggregate, value);
    if (result === error_obj.e) {
      this.destination.error(error_obj.e);
    } else {
      this.aggregate = result;
    }
  }
  
  _complete(value: any) {
    this.destination.next(this.aggregate);
    this.destination.complete(value);
  }
}

class ReduceSubscriberFactory extends SubscriberFactory {
  processor: (accum: any, value: any) => any;
  initialValue: any;
  
  constructor(processor: (accum: any, value: any) => any, initialValue: any) {
    super();
    this.processor = processor;
    this.initialValue = initialValue;
  }
  
  create(destination: Subscriber): Subscriber {
    return new ReduceSubscriber(destination, this.processor, this.initialValue);
  }
}

export default function reduce(processor:(accum:any, value:any)=>any, initialValue: any) : Observable {
  return this.lift(new ReduceSubscriberFactory(processor, initialValue));
}
