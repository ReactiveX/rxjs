import Observable from '../Observable';

class PromiseObservable extends Observable {
	promise:Promise<any>;
	
	constructor(promise:Promise<any>) {
		super(null);
		this.promise = promise;	
	}
	
	subscriber(observer:Observer) {
		if(promise) {
			promise.then(x => {
				if(!observer.unsubscribed) {
					observer.next(x);
				}
				observer.return();
			});
		}
	}
}

export default function fromPromise(promise:Promise<any>) : Observable {
	return new PromiseObservable(promise);
}