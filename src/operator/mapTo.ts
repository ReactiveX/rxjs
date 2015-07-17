import Observer from '../Observer';
import error_obj from '../util/errorObject';
import Observable from '../Observable';
import Subscription from '../Subscription';
import ObserverFactory from '../ObserverFactory';

class MapToObserver extends Observer {
  value:any;
  
  constructor(destination: Observer, value: any) {
    super(destination);
    this.value = value;
  }
  
  _next(_: any) {
    return this.destination.next(this.value);
  }
}

class MapToObserverFactory extends ObserverFactory {
  value: any;
  
  constructor(value: any) {
    super();
    this.value = value;
  }
  
  create(destination: Observer): Observer {
    return new MapToObserver(destination, this.value);
  }
}

export default function mapTo(value: any): Observable {
  return this.lift(new MapToObserverFactory(value));
};
