export default class Subscription {
	length:number = 0;
	unsubscribed:boolean = false;
	_unsubscribe:Function;
	
	constructor(unsubscribe:Function) {
    this._unsubscribe = unsubscribe;
	}
	
	static get empty() {
		return new Subscription(null);
	}
	
	unsubscribe():void {
    if(this.unsubscribed) { return; }
    this.unsubscribed = true;
    var unsubscribe = this._unsubscribe;
    if(unsubscribe) {
        this._unsubscribe = undefined;
        unsubscribe.call(this);
    }
	}
	
	add(subscription:Subscription):Subscription {
		return this;
	}
	
	remove(subscription:Subscription):Subscription {
		return this;
	}
}