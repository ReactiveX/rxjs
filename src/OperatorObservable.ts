import Observer from './Observer';
import Scheduler from './Scheduler';
import Subscription from './Subscription';
import SerialSubscription from './SerialSubscription';

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
    if (!Scheduler.active) {
        var self = this;
        return Scheduler.schedule(0, null, function scheduleSubscribe() {
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