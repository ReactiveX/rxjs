import Observer from './Observer';
import Scheduler from './Scheduler';
import Subscription from './Subscription';
import SerialSubscription from './SerialSubscription';

const immediateScheduler = Scheduler.immediate;

export interface ObserverProvider {
  getObserver(destination:Observer):Observer;
}

var defaultObserverProvider:ObserverProvider = {
    getObserver(destination:Observer):Observer {
        return new Observer(destination);
    }
};

export default class OperatorObservable {  
  source:OperatorObservable = null;
  observerProvider:ObserverProvider = null;
  
  static value:(value:any,scheduler:Scheduler)=>OperatorObservable;
  static return:(value:any,scheduler:Scheduler)=>OperatorObservable;
  static fromEvent:(element:any, eventName:string, selector:Function)=>OperatorObservable;
  static fromEventPattern:(addHandler:Function, removeHandler:Function, selector:Function)=>OperatorObservable;
  
  select:(project:any)=>OperatorObservable;
  map:(project:any)=>OperatorObservable;
  mergeAll:(concurrent?:number)=>OperatorObservable;
  selectMany:(project:any, concurrent?:number)=>OperatorObservable;
  flatMap:(project:any, concurrent?:number)=>OperatorObservable;
  
  constructor(source:OperatorObservable, observerProvider:ObserverProvider=defaultObserverProvider) {
    this.source = source;
    this.observerProvider = observerProvider || defaultObserverProvider;
  }
  
  static create(subscribe:(observer:Observer)=>any):OperatorObservable {
    return new OperatorObservable(<OperatorObservable>{ subscribe: subscribe });
  }
  
  subscribe(a, b=null, c=null) {
    if(!a || typeof a !== "object") {
        a = Observer.create(a, b, c);
    }
    if (!immediateScheduler.active) {
        var self = this;
        return immediateScheduler.schedule(0, null, function scheduleSubscribe() {
            return self._subscribe(a);
        });
    }
    return this._subscribe(a);
  }
  
  _subscribe(destination) {
    var subscriptionResult = this.source.subscribe(this.observerProvider.getObserver(destination));
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