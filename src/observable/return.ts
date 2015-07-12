import Observable from '../Observable';
import Observer from '../Observer';
import $$observer from '../util/Symbol_observer';

class ReturnObservable extends Observable {
  returnValue:any;
  
  constructor(returnValue:any) {
    super(null);
    this.returnValue = returnValue; 
  }
  
  [$$observer](observer:Observer) {
    observer.complete(this.returnValue);
  }
}

export default function _return(returnValue:any=undefined) : Observable {
  return new ReturnObservable(returnValue);
}