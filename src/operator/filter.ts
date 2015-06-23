import Observer from '../Observer';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import Observable from '../Observable';
import Subscription from '../Subscription';

interface IteratorResult<T> {
  done:boolean;
  value?:T
}

class FilterObserver extends Observer {
  predicate:(any)=>boolean;
  
  constructor(destination:Observer, predicate:(any)=>boolean) {
    super(destination);
    this.predicate = predicate;
  }
  
  _next(value:any):IteratorResult<any> {
    var result = try_catch(this.predicate).call(this, value);
    if(result === error_obj) {
        return this.destination["throw"](error_obj.e);
    } else if (Boolean(result)) {
        return this.destination.next(value);
    }
  }
}

class FilterObservable extends Observable {
  source:Observable;
  predicate:(any)=>boolean;
  
  constructor(source:Observable, predicate:(any)=>boolean) {
    super(null);
    this.source = source;
    this.predicate = predicate;
  }
  
  subscriber(observer:Observer):Subscription {
    var filterObserver = new FilterObserver(observer, this.predicate);
    return Subscription.from(this.source.subscriber(filterObserver), filterObserver);
  }
}

export default function select(predicate:(any)=>boolean) : Observable {
  return new FilterObservable(this, predicate);
};
