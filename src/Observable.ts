import Observer from './Observer';
import Scheduler from './Scheduler';
import Subscription from './Subscription';
import SerialSubscription from './SerialSubscription';

const immediateScheduler = Scheduler.immediate;


export default class Observable {  
  static value:(value:any,scheduler:Scheduler)=>Observable;
  static return:(value:any,scheduler:Scheduler)=>Observable;
  static fromEvent:(element:any, eventName:string, selector:Function)=>Observable;
  static fromEventPattern:(addHandler:Function, removeHandler:Function, selector:Function)=>Observable;
  static throw:(err:any, scheduler:Scheduler)=>Observable;
  static empty:(scheduler:Scheduler)=>Observable;
  static range:(start:number,end:number,scheduler:Scheduler)=>Observable;
  
  select:(project:any)=>Observable;
  map:(project:any)=>Observable;
  mergeAll:(concurrent?:number)=>Observable;
  selectMany:(project:any, concurrent?:number)=>Observable;
  flatMap:(project:any, concurrent?:number)=>Observable;
  
  constructor(subscriber:(observer:Observer)=>Function) {
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
  
  subscribe(a, b=null, c=null) {
    if(!a || typeof a !== "object") {
        a = Observer.create(a, b, c);
    }
    if (!immediateScheduler.active) {
        return immediateScheduler.schedule(0, null, () => this.subscriber(a));
    }
    return Subscription.from(this.subscriber(a));
  }
}