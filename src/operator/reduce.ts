import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import Observable from '../Observable';
import Observer from '../Observer';
import Subscription from '../Subscription';

interface IteratorResult<T> {
  value?: T;
  done: boolean;
}

class ReduceObserver extends Observer {
  processor: (accum: any, value: any) => any;
  aggregate: any;
  
  constructor(destination: Observer, processor: (accum: any, value: any) => any, initialValue: any) {
    super(destination);
    this.processor = processor;
    this.aggregate = initialValue;
  }
  
  _next(value: any): IteratorResult<any> {
    var result = try_catch(this.processor)(this.aggregate, value);
    if (result === error_obj.e) {
      this.destination.throw(error_obj.e);
    } else {
      this.aggregate = result;
    }
    return { done: false };
  }
  
  _return(value: any):IteratorResult<any> {
    this.destination.next(this.aggregate);
    return this.destination.return(value);
  }
}

class ReduceObservable extends Observable {
  source: Observable;
  processor: (accum: any, value: any) => any;
  initialValue: any;
  
  constructor(source: Observable, processor: (accum: any, value: any) => any, initialValue: any) {
    super(null);
    this.source = source;
    this.processor = processor;
    this.initialValue = initialValue;
  }
  
  subscriber(observer:Observer):Subscription {
    var reduceObserver = new ReduceObserver(observer, this.processor, this.initialValue);
    return Subscription.from(this.source.subscriber(reduceObserver), reduceObserver);
  }
}

export default function reduce(processor:(accum:any, value:any)=>any, initialValue: any) : Observable {
  return new ReduceObservable(this, processor, initialValue);
}
