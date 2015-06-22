import Observable from './Observable';
import Observer from './Observer';
import $$observer from './util/Symbol_observer';
import SerialSubscription from './SerialSubscription';
import Subscription from './Subscription';
import Subject from './Subject';
import { IteratorResult } from './IteratorResult';

export default class BehaviorSubject extends Subject {
	value:any;
	
	constructor(value:any) {
		super(null);
		this.value = value;
	}
	
	[$$observer](observer:Observer) {
		this.observers.push(observer);
		var subscription = new Subscription(null, observer);
		this.next(this.value);
		return subscription;
	}
	
	next(value:any):IteratorResult<any> {
		this.value = value;
		return super.next(value);
	}
}