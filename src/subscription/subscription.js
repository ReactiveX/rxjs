export default class Subscription {
	constructor(action) {
		this.isDisposed = false;
		this._action = action;
	}

	dispose() {
		if(!this.isDisposed && this._action) {
			this._action();
		}
		this.isDisposed = true;
	}

	child(action) {
		var ChildSubscription = function(action) {
			this._action = action;
		}

		ChildSubscription.prototype = this;

		return new ChildSubscription(action)
	}
}