import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import Observable from '../Observable';
import Observer from '../Observer';
import Subscription from '../Subscription';
import ObserverFactory from '../ObserverFactory';

class ReduceObserver extends Observer {
  processor: (accum: any, value: any) => any;
  aggregate: any;
  
  constructor(destination: Observer, processor: (accum: any, value: any) => any, initialValue: any) {
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

class ReduceObserverFactory extends ObserverFactory {
  processor: (accum: any, value: any) => any;
  initialValue: any;
  
  constructor(processor: (accum: any, value: any) => any, initialValue: any) {
    super();
    this.processor = processor;
    this.initialValue = initialValue;
  }
  
  create(destination: Observer): Observer {
    return new ReduceObserver(destination, this.processor, this.initialValue);
  }
}

export default function reduce(processor:(accum:any, value:any)=>any, initialValue: any) : Observable {
  return this.lift(new ReduceObserverFactory(processor, initialValue));
}
