import Observer from './Observer';
import Scheduler from './Scheduler';
import Subscription from './Subscription';
import SerialSubscription from './SerialSubscription';

const immediateScheduler = Scheduler.immediate;

export interface ObserverProvider {
  getObserver(destination:Observer, subscription:Subscription):Observer;
}

var defaultObserverProvider:ObserverProvider = {
    getObserver(destination:Observer, subscription):Observer {
        return new Observer(destination, subscription);
    }
};

export default class Observable {  
  source:Observable = null;
  observerProvider:ObserverProvider = null;
  
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
  
  constructor(source:Observable|((Observer)=>Function|Subscription|void), observerProvider:ObserverProvider=defaultObserverProvider) {
    if(typeof source === 'function') {
      // spec compliant observable
      this.source = Observable.create(<(Observer)=>any>source);
    } else {
      this.source = <Observable>source;
    }
      this.observerProvider = observerProvider || defaultObserverProvider;
  }
  
  static create(subscribe:(observer:Observer)=>any):Observable {
    return new Observable(<Observable>{ subscribe: subscribe });
  }
  
  subscribe(a:Observer|((any)=>IteratorResult<any>), b:((any)=>IteratorResult<any>)=null, c:(()=>IteratorResult<any>)=null) {
    if(!a || typeof a !== "object") {
        a = Observer.create(<(any)=>IteratorResult<any>>a, b, c);
    }
    if (!immediateScheduler.active) {
        return immediateScheduler.schedule(0, null, () => this._subscribe(a));
    }
    return this._subscribe(a);
  }
  
  _subscribe(destination) {
    var subscription = new SerialSubscription(null);
    var subscriptionResult = this.source.subscribe(this.observerProvider.getObserver(destination, subscription));
    switch(typeof subscriptionResult) {
        case "function":
            return new Subscription(subscriptionResult);
        case "object": 
            return subscriptionResult || Subscription.empty;
        default:
            return Subscription.empty
    }
  }
}