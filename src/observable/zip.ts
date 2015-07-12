import Observable from '../Observable';
import Observer from '../Observer';
import CompositeSubscription from '../CompositeSubscription';
import SerialSubscription from '../SerialSubscription';
import Subscription from '../Subscription';
import $$observer from '../util/Symbol_observer';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';

class ZipObservable extends Observable {
  observables:Array<Observable>;
  project:(...observables: Array<Observable>)=>Observable;
  
  constructor(observables: Array<Observable>, project:(...observables:Array<Observable>)=>Observable) {
    super(null);
    this.observables = observables;
    this.project = project;
  }
  
  subscriber(observer:Observer):Subscription {
    var subscriptions = new CompositeSubscription();
    this.observables.forEach((obs, i) => {
      var innerObserver = new InnerZipObserver(observer, i, this.project, subscriptions, obs);
      subscriptions.add(Subscription.from(obs[$$observer](innerObserver), innerObserver));
    });
    return subscriptions;
  }
}

class InnerZipObserver extends Observer {
  index:number;
  project:(...observer:Array<Observable>)=>Observable;
  subscriptions:CompositeSubscription
  observable:Observable;
  buffer:Array<any> = [];
  
  constructor(destination:Observer, index:number, 
    project:(...observables:Array<Observable>)=>Observable,
    subscriptions:CompositeSubscription,
    observable:Observable) {
    super(destination);
    this.index = index;
    this.project = project;
    this.subscriptions = subscriptions;
    this.observable = observable;
  }
  
  _next(value: any) {
    this.buffer.push(value);
  }
  
  _canEmit() {
    return this.subscriptions._subscriptions.every(sub => {
      var observer = <InnerZipObserver>sub.observer;
      return !observer.unsubscribed && observer.buffer.length > 0;
    });
  }
  
  _getArgs() {
    return this.subscriptions._subscriptions.reduce((args, sub) => {
      var observer = <InnerZipObserver>sub.observer;
      args.push(observer.buffer.shift());
      return args;
    }, []);
  }
  
  _checkNext() {
    if(this._canEmit()) {
      var args = this._getArgs();
      return this._sendNext(args);
    }
  }
  
  _sendNext(args: Array<any>) {
    var value = try_catch(this.project).apply(this, args);
    if(value === error_obj) {
      this.destination.error(error_obj.e);
    } else {
      this.destination.next(value);
    }
  }
}

export default function zip(observables:Array<Observable>, project:(...observables:Array<Observable>)=>Observable) : Observable {
  return new ZipObservable(observables, project);
}