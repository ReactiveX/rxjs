import Observable from './Observable';
import Observer from './Observer';
import $$observer from './util/Symbol_observer';
import SerialSubscription from './SerialSubscription';
import Subscription from './Subscription';

export interface IteratorResult<T> {
	value?:T;
	done:boolean;
}

export default class Subject extends Observable {
	destination:Observer;
	disposed:boolean=false;
	observers:Array<Observer> = [];
	
	dispose() {
		this.disposed = true;
		this.observers.length = 0;
	}
	
	[$$observer](observer:Observer) : Subscription {
		this.observers.push(observer);
		var subscription = new Subscription(null, observer);
		return subscription;
	}
	
	next(value:any) : IteratorResult<any> {
		this.observers.forEach(o => o.next(value));
		return { done: false };
	}
	
	throw(err:any) : IteratorResult<any> {
		this.observers.forEach(o => o.throw(err));
		return { done: true };
	}

	return(value:any) : IteratorResult<any> {
		this.observers.forEach(o => o.return(value));
		return { done: true };
	}	
}

class SubjectSubscription extends Subscription {
	subject:Subject;
	
	constructor(observer:Observer, subject:Subject) {
		super(null, observer);
		this.subject = subject;	
	}
	
	unsubscribe() {
		var observers = this.subject.observers;
		var index = observers.indexOf(this.observer);
		if(index !== -1) {
			observers.splice(index, 1);
		}
		super.unsubscribe();
	}
}