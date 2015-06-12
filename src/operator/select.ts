import Observer from '../Observer';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import Observable from '../Observable';
import Subscription from '../Subscription';

interface IteratorResult<T> {
	done:boolean;
	value?:T
}

function getObserver(destination) {
    return new SelectObserver(destination, this.project);
};

class SelectObserver extends Observer {
  value:any;
  
  project:(any)=>any;
  
  constructor(destination, project) {
    super(destination);
    if(typeof project !== "function") {
        this.value = project;
    } else {
        this.project = project;
    }
  }
  
  _next(value:any):IteratorResult<any> {
    value = try_catch(this.project).call(this, value);
    if(value === error_obj) {
        return this.destination["throw"](error_obj.e);
    } else {
        return this.destination.next(value);
    }
  }
}

SelectObserver.prototype.project = function projectValue():any {
    return this.value;
};

class SelectObservable extends Observable {
  source:Observable;
  project:(any)=>any;
  
  constructor(source:Observable, project:(any)=>any) {
    super(null);
    this.source = source;
    this.project = project;
  }
  
  subscriber(observer:Observer):Subscription {
    return Subscription.from(this.source.subscriber(new SelectObserver(observer, this.project)));
  }
}

export default function select(project:(any)=>any) : Observable {
  return new SelectObservable(this, project);
};
