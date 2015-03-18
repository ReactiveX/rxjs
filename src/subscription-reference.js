export default class SubscriptionReference {
	constructor(subscription) {
		this._subscription = subscription;
		this.isDisposeScheduled = false;
		this.isDisposed = false;
	}

	get value() {
		return this._subscription;
	}

	set value(subscription) {
		this._subscription = subscription;
		if(this.isDisposeScheduled) {
			this._dispose();
		}
	}

	_dispose() {
		this._subscription.dispose();
		this.isDisposeScheduled = false;
		this.isDisposed = true;		
	}

	dispose() {
		if(!this._subscription) {
			this.isDisposeScheduled = true;
		}
		else {
			this._dispose();
		}
	}
}