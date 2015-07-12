import Observer from '../Observer';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import Observable from '../Observable';
import Subscription from '../Subscription';
import ObserverFactory from '../ObserverFactory';

class MapObserver extends Observer {
  project:(any)=>any;
  
  constructor(destination:Observer, project:(any)=>any) {
    super(destination);
    this.project = project;
  }
  
  _next(value:any) {
    value = try_catch(this.project).call(this, value);
    if(value === error_obj) {
      this.destination.error(error_obj.e);
    } else {
      this.destination.next(value);
    }
  }
}

class MapObserverFactory extends ObserverFactory {
  project: (any) => any;

  constructor(project: (any) => any) {
    super();
    this.project = project;
  }
  
  create(destination: Observer): Observer {
    return new MapObserver(destination, this.project);
  }
}

export default function select(project:(any)=>any) : Observable {
  return this.lift(new MapObserverFactory(project))
};
