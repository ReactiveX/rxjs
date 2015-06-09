import Observer from '../Observer';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import OperatorObservable from '../OperatorObservable';

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

export default function select(project:(any)=>any) : OperatorObservable {
    return new this.constructor(this, { project: project, getObserver: getObserver });
};
