import Observable from '../Observable';
import Subscriber from '../Subscriber';

class ReturnObservable extends Observable {
  returnValue:any;
  
  constructor(returnValue:any) {
    super(null);
    this.returnValue = returnValue; 
  }
  
  subscriber(subscriber:Subscriber) {
    subscriber.complete(this.returnValue);
  }
}

export default function _return(returnValue:any=undefined) : Observable {
  return new ReturnObservable(returnValue);
}