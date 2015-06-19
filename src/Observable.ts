import Observer from './Observer';
import Subscription from './Subscription';
import SerialSubscription from './SerialSubscription';
import nextTick from './scheduler/nextTick';
import $$observer from './util/Symbol_observer';
import Scheduler from './scheduler/Scheduler';

export default class Observable {  
  static value:(value:any)=>Observable;
  static return:(returnValue:any)=>Observable;
  static fromEvent:(element:any, eventName:string, selector:Function)=>Observable;
  static fromEventPattern:(addHandler:Function, removeHandler:Function, selector:Function)=>Observable;
  static throw:(err:any)=>Observable;
  static empty:()=>Observable;
  static never:()=>Observable;
  static range:(start:number,end:number)=>Observable;
  static fromArray:(array:Array<any>)=>Observable;
  
  map:(project:(any)=>any)=>Observable;
  mapTo:(value:any)=>Observable;
  mergeAll:(concurrent?:number)=>Observable;
  flatMap:(project:any, concurrent?:number)=>Observable;
  concatAll:()=>Observable;
  skip:(count:number)=>Observable;
  take:(count:number)=>Observable;
  subscribeOn:(scheduler:Scheduler)=>Observable;
  observeOn:(scheduler:Scheduler)=>Observable;
  zipAll:(project:(...Observable)=>Observable)=>Observable;
  
  constructor(subscriber:(observer:Observer)=>Function|void) {
    if(subscriber) {
      this.subscriber = subscriber;
    }
  }
  
  static create(subscriber:(observer:Observer)=>any):Observable {
    return new Observable(subscriber);
  }
  
  subscriber(observer:Observer):Function|Subscription|void {
    return void 0;
  }
  
  [$$observer](observer:Observer) {
    return Subscription.from(this.subscriber(observer), observer);
  }
  
  subscribe(observerOrNextHandler:Observer|((any)=>IteratorResult<any>),
    throwHandler:(any)=>IteratorResult<any>=null,
    returnHandler:(any)=>IteratorResult<any>=null) {
      var observer;
      if(typeof observerOrNextHandler === 'object') {
        observer = observerOrNextHandler;
      } else {
        observer = Observer.create(<(any)=>IteratorResult<any>>observerOrNextHandler, throwHandler, returnHandler);
      }
      
      return nextTick.schedule(0, [observer, this], dispatchSubscription);
    }
  
  forEach(nextHandler) {
    return new Promise((resolve, reject) => {
      var observer = Observer.create((value) => {
       nextHandler(value);
       return { done: false }; 
      }, (err) => {
        reject(err); 
        return { done: true };
      }, (value) => {
        resolve(value);
        return { done: true };
      });
      this[$$observer](observer);
    });
  }
}

function dispatchSubscription([observer, observable]) {
  return observable[$$observer](observer);
}