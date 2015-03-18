import SubscriptionReference from './subscription-reference';

export default class CompositeSubscriptionReference extends Subscription {
	add(subscription) {
		if(!this._subscription) {
			this.pendingAdds = this.pendingAdds || [];
			this.pendingAdds.push(subcription);
		} else {
			this._subscription.add(subcription);
		}
	}

	remove(subscription) {
		if(!this._subscription && this.pendingAdds) {
			this.pendingAdds.splice(this.pendingAdds.indexOf(subcription), 1);
		} else {
			this._subscription.remove(subcription);
		}
	}

	setSubscription(subscription) {
		if(this.pendingAdds) {
			this.pendingAdds.forEach((sub) => {
				subcription.add(sub);
			});
			this.pendingAdds = null;
		}

		return Subscription.prototype.setSubscription.call(this, subcription);
	}
}