import noop from './util/noop';

export default class Observer {
  destination:Observer;
  unsubscribed:boolean = false;
  result:IteratorResult<any>
  
  static create(_next:(value:any)=>IteratorResult<any>, 
                _throw:((value:any)=>IteratorResult<any>)=null, 
                _return:(()=>IteratorResult<any>)=null) : Observer {
    var observer = new Observer(null);
    observer._next = _next;
    observer._throw = _throw;
    observer._return = _return;
    return observer;
  }
  
  _next(value:any):IteratorResult<any> {
    return this.destination["next"](value);
  }

  _throw(error:any):IteratorResult<any> {
    return this.destination["throw"](error);
  }

  _return():IteratorResult<any> {
    return this.destination["return"]();
  }
  
  constructor(destination:Observer) {
    this.result = destination && destination.result || { done: false }
    this.destination = destination;
  }
  
  unsubscribe():void {
    this.unsubscribed = true;
  }
  
  next(value:any):IteratorResult<any> { 
    var result = this.result;
    if (this.unsubscribed || Boolean(result.done)) {
        return result;
    }

    var result2 = this._next(value) || result;
    if (result !== result2) {
        result.done = result2.done;
        result.value = result2.value;
    }
    
    if (result.done) {
        this.unsubscribe();
    }
    
    return result;
  }
  
  throw(error:any):IteratorResult<any> {    
    var result = this.result;
    if (this.unsubscribed || Boolean(result.done)) {
        return result;
    }

    var result2 = this._throw(error) || result;
    if (result !== result2) {
        result.value = result2.value;
    }
    
    result.done = true;
    this.unsubscribe();
    return result;
  }
  
  return():IteratorResult<any> {
    var result = this.result;
    if (this.unsubscribed || Boolean(result.done)) {
        return result;
    }

    var result2 = this._return() || result;
    if (result !== result2) {
        result.value = result2.value;
    }

    result.done = true;
    this.unsubscribe();
    return result;
  }
}