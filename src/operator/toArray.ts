import Observable from '../Observable';
import Observer from '../Observer';
import Subscription from '../Subscription';

interface IteratorResult<T> {
	value?:T;
	done:boolean;
}

class ToArrayObserver extends Observer {
	array:Array<any> = [];
	
	constructor(destination:Observer) {
		super(destination);
	}
	
  _next(value:any):IteratorResult<any> {
		this.array.push(value);
		return { done: false };
	}
	
	_return(value:any):IteratorResult<any> {
		this.destination.next(this.array);
		return this.destination.return(value);
	}
}

class ToArrayObservable extends Observable {
	source:Observable;
	
	constructor(source:Observable) {
		super(null);
		this.source = source;
	}
	
	subscriber(observer:Observer) {
    var toArrayObserver = new ToArrayObserver(observer);
    return Subscription.from(this.source.subscriber(toArrayObserver), toArrayObserver);
	}
}

export default function toArray():Observable {
	return new ToArrayObservable(this);
}