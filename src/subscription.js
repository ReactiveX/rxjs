export default class Subscription {
	constructor(action) {
		this._action = action;
	}

	dispose() {
		this._action();
	}

	child(action) {
		class ChildSubscription extends Subscription {
			dispose() {
				this._action();
				super.dispose();
			}
		}

		return new ChildSubscription(action)
	}
}