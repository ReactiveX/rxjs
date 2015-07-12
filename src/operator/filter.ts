import Observer from '../Observer';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import Observable from '../Observable';
import Subscription from '../Subscription';
import ObserverFactory from '../ObserverFactory';

class FilterObserver extends Observer {
  predicate: (x: any) => boolean;
  
  constructor(destination: Observer, predicate: (x: any) => boolean) {
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

class FilterObserverFactory extends ObserverFactory {
  predicate: (x: any) => boolean;
  
  constructor(predicate: (x: any) => boolean) {
    super();
    this.predicate = predicate;
  }
  
  create(destination: Observer): Observer {
    return new FilterObserver(destination, this.predicate);
  }
}


export default function select(predicate: (x: any) => boolean) : Observable {
  return this.lift(new FilterObserverFactory(predicate));
};
