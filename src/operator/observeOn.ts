import Observable from '../Observable';
import Subscriber from '../Subscriber';
import Scheduler from '../scheduler/Scheduler';
import SubscriberFactory from '../SubscriberFactory';

class ObserveOnSubscriber extends Subscriber {
  scheduler:Scheduler;
  
  constructor(destination:Subscriber, scheduler:Scheduler) {
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

class ObserveOnSubscriberFactory extends SubscriberFactory {
  scheduler: Scheduler;
  
  constructor(scheduler: Scheduler) {
    super();
    this.scheduler = scheduler;
  }
  
  create(destination: Subscriber): Subscriber {
    return new ObserveOnSubscriber(destination, this.scheduler);
  }
}

export default function observeOn(scheduler: Scheduler): Observable {
  return this.lift(new ObserveOnSubscriberFactory(scheduler));
}