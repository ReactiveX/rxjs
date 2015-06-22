import Observer from './Observer';

export default class Subscription {
	length:number = 0;
	unsubscribed:boolean = false;
	_unsubscribe:Function;
	observer:Observer;
	
	constructor(_unsubscribe:Function, observer:Observer) {
    this._unsubscribe = _unsubscribe;
		this.observer = observer;
	}
	
	unsubscribe():void {
    if(this.unsubscribed) { return; }
    this.unsubscribed = true;
    var unsubscribe = this._unsubscribe;
    if(unsubscribe) {
        this._unsubscribe = undefined;
        unsubscribe.call(this);
    }
		var observer = this.observer;
		if(observer) {
			this.observer = undefined;
			if(observer.dispose && observer._dispose) {
				observer.dispose();
			}
			else if(observer.return && observer._return) {
				observer.return();
			}
		}
	}
	
	add(subscription:Subscription):Subscription {
		return this;
	}
	
	remove(subscription:Subscription):Subscription {
		return this;
	}
	
	static from(value:any, observer:Observer):Subscription {
		if(!value) {
			return new Subscription(undefined, observer);
		}
		else if(value && typeof value.unsubscribe === 'function') {
			return value;
		}
		else if(typeof value === 'function') {
			return new Subscription(value, observer);
		}
	}
}