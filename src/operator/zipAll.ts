import Observable from '../Observable';
import Observer from '../Observer';
import CompositeSubscription from '../CompositeSubscription';
import SerialSubscription from '../SerialSubscription';
import Subscription from '../Subscription';
import $$observer from '../util/Symbol_observer';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';

interface IteratorResult<T> {
	value?:T;
	done:boolean;
}

class ZipAllObservable extends Observable {
	source:Observable;
	project:(...Observable)=>Observable;
	
	constructor(source:Observable, project:(...Observable)=>Observable) {
		super(null);
		this.source = source;
		this.project = project;
	}
	
	subscriber(observer:Observer) : Subscription {
		var zipAllObserver = new ZipAllObserver(observer, this.project);
		return Subscription.from(this.source.subscriber(zipAllObserver), zipAllObserver);
	}
}

class ZipAllObserver extends Observer {
	project:(...Observable)=>Observable;
	sending:number = 0;
	subscriptions:CompositeSubscription = new CompositeSubscription();
	
	constructor(destination:Observer, project:(...Observable)=>Observable) {
		super(destination);
		this.project = project;
	}
	
	_next(observable:any):IteratorResult<any> {
		var subscriptions = this.subscriptions;
    var innerSubscription = new SerialSubscription(null);
    var innerObserver = new InnerZipAllObserver(innerSubscription, subscriptions.length, this);
    this.subscriptions.add(innerSubscription);
    innerSubscription.add(observable[$$observer](innerObserver));

		return { done: false };
	}
	
	_checkNext() : IteratorResult<any> {
		if(this._hasBufferedValues()) {
			var args = this.subscriptions._subscriptions.reduce((args, s) => {
				var innerObserver = (<InnerZipAllObserver>s.observer);
				args.push(innerObserver.buffer.shift());
				return args;
			}, [])
			
			var projection = try_catch(this.project).apply(this, args);
	    if(projection === error_obj) {
	      return this.destination["throw"](error_obj.e);
	    } else {
				return this.destination.next(projection);
	    }
		}
	}
	
	_hasBufferedValues():boolean {
		return this.subscriptions._subscriptions.every(s => {
			var innerObserver = <InnerZipAllObserver>s.observer;
			return innerObserver.disposed || innerObserver.buffer.length > 0;
		});
	}
}

class InnerZipAllObserver extends Observer {
	subscription:Subscription;
	parent:ZipAllObserver;
	index:number;
	sending:number = 0;
	buffer:Array<any> = [];
	
	constructor(subscription:Subscription, index:number, parent:ZipAllObserver) {
		super(null);
		this.subscription = subscription;
		this.index = index;
		this.parent = parent;
	}
	
	_next(value:any):IteratorResult<any> {
		if(this.parent.disposed) {
			return { done: true };
		}
		this.buffer.push(value);
		this.parent._checkNext();
		return { done: false };
	}
}

export default function zipAll(project:(...Observable)=>Observable) : Observable {
	return new ZipAllObservable(this, project);
}