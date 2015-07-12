import Observable from '../Observable';
import Observer from '../Observer';
import Scheduler from '../scheduler/Scheduler';
import Subscription from '../Subscription';
import ObserverFactory from '../ObserverFactory';

class ObserveOnObserver extends Observer {
  scheduler:Scheduler;
  
  constructor(destination:Observer, scheduler:Scheduler) {
    super(destination);
    this.scheduler = scheduler;   
  }
  
  next(value: any) {
    this.scheduler.schedule(0, [this.destination, value], dispatchNext);
  }
  
  _error(err: any) {
    this.scheduler.schedule(0, [this.destination, err], dispatchError);
  }
  
  _complete(value:any) {
    this.scheduler.schedule(0, [this.destination, value], dispatchComplete);
  }
}

function dispatchNext([destination, value]) {
  var result = destination.next(value);
  if(result.done) {
    destination.dispose();
  }
}

function dispatchError([destination, err]) {
  var result = destination.error(err);
  destination.dispose();
}

function dispatchComplete([destination, value]) {
  var result = destination.complete(value);
  destination.dispose();
}

class ObserveOnObserverFactory extends ObserverFactory {
  scheduler: Scheduler;
  
  constructor(scheduler: Scheduler) {
    super();
    this.scheduler = scheduler;
  }
  
  create(destination: Observer): Observer {
    return new ObserveOnObserver(destination, this.scheduler);
  }
}

export default function observeOn(scheduler: Scheduler): Observable {
  return this.lift(new ObserveOnObserverFactory(scheduler));
}