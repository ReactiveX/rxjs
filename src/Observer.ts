import noop from './util/noop';
import Subscription from './Subscription';

export default class Observer {
  destination:Observer;
  unsubscribed:boolean = false;
  
  static create(_next: (value:any) => void, 
                _error: ((value:any) => void) = null, 
                _completed: ((value:any) => void) = null) : Observer {
    var observer = new Observer(null);
    observer._next = _next;
    if(_error) { 
      observer._error = _error; 
    }
    if(_completed) {
      observer._completed = _completed;
    }
    return observer;
  }
  
  _next(value:any) {
    this.destination.next(value);
  }

  _error(error:any) {
    var destination = this.destination;
    if(destination && destination.error) {
      destination.error(error);
    } else {
      throw error;
    }
  }

  _completed(value:any) {
    var destination = this.destination;
    if(destination && destination.complete) {
      destination.complete(value);
    }
  }
  
  constructor(destination:Observer) {
    this.destination = destination;
  }
  
  next(value:any) { 
    if (this.unsubscribed) {
      return;
    }
    this._next(value);
  }
  
  error(error:any) {    
    if (this.unsubscribed) {
      return;
    }
    var result = this._error(error);  
    this.unsubscribe();
  }
  
  complete(value:any=undefined) {
    if(this.unsubscribed) {
      return;
    }
    var result = this._completed(value);
    this.unsubscribe();
  }
  
  unsubscribe() {
    this.unsubscribed = true;
  }
}