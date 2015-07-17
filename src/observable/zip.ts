import Observable from '../Observable';
import Subscriber from '../Subscriber';
import CompositeSubscription from '../CompositeSubscription';
import SerialSubscription from '../SerialSubscription';
import $$observer from '../util/Symbol_observer';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import { Subscription } from '../Subscription';

class ZipObservable extends Observable {
  observables:Array<Observable>;
  project:(...observables: Array<Observable>)=>Observable;
  
  constructor(observables: Array<Observable>, project:(...observables:Array<Observable>)=>Observable) {
    super(null);
    this.observables = observables;
    this.project = project;
  }
  
  subscriber(subscriber:Subscriber):Subscription {
    this.observables.forEach((obs, i) => {
      var innerSubscriber = new InnerZipSubscriber(subscriber, i, this.project, obs);
      subscriber.add(obs[$$observer](innerSubscriber));
    });
    return subscriber;
  }
}

class InnerZipSubscriber extends Subscriber {
  index:number;
  project:(...observer:Array<Observable>)=>Observable;
  observable:Observable;
  buffer:Array<any> = [];
  
  constructor(destination:Subscriber, index:number, 
    project:(...observables:Array<Observable>)=>Observable,
    observable:Observable) {
    super(destination);
    this.index = index;
    this.project = project;
    this.observable = observable;
  }
  
  _next(value: any) {
    this.buffer.push(value);
  }
  
  _canEmit() {
    return this.subscriptions.every(subscription => {
      var sub = <InnerZipSubscriber>subscription;
      return !sub.isUnsubscribed && sub.buffer.length > 0;
    });
  }
  
  _getArgs() {
    return this.subscriptions.reduce((args, subcription) => {
      var sub = <InnerZipSubscriber>subcription;
      args.push(sub.buffer.shift());
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