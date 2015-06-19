import Observable from '../Observable';
import Observer from '../Observer';
import Scheduler from '../scheduler/Scheduler';
import Subscription from '../Subscription';

interface IteratorResult<T> {
	value?:T;
	done:boolean;
}

class ObserveOnObserver extends Observer {
	scheduler:Scheduler;
	
	constructor(destination:Observer, scheduler:Scheduler) {
		super(destination);
		this.scheduler = scheduler;		
	}
	
	_next(value:any) : IteratorResult<any> {
		this.scheduler.schedule(0, [this.destination, value], dispatchNext);
		return { done: false };
	}
	
	_throw(err:any) : IteratorResult<any> {
		this.scheduler.schedule(0, [this.destination, err], dispatchThrow);
		return { done: true };
	}
	
	_return(value:any) : IteratorResult<any> {
		this.scheduler.schedule(0, [this.destination, value], dispatchReturn);
		return { done: true };
	}
}

function dispatchNext([destination, value]) {
	var result = destination.next(value);
	if(result.done) {
		destination.dispose();
	}
}

function dispatchThrow([destination, err]) {
	var result = destination.throw(err);
	destination.dispose();
}

function dispatchReturn([destination, value]) {
	var result = destination.return(value);
	destination.dispose();
}

class ObserveOnObservable extends Observable {
	scheduler:Scheduler;
	source:Observable;
	
	constructor(source:Observable, scheduler:Scheduler) {
		super(null);
		this.source = source;
		this.scheduler = scheduler;	
	}

  subscriber(observer:Observer):Subscription {
    var observeOnObserver = new ObserveOnObserver(observer, this.scheduler);
    return Subscription.from(this.source.subscriber(observeOnObserver), observeOnObserver);
  }
}

export default function observeOn(scheduler:Scheduler):Observable {
	return new ObserveOnObservable(this, scheduler);
}