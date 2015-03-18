export default class Subscription {
	constructor(action) {
		this._action = action;
	}

	dispose() {
		this._action();
	}

	child(action) {
		var ChildSubscription = function(action) {
			this._action = action;
		}

		ChildSubscription.prototype = this;

		return new ChildSubscription(action)
	}
}