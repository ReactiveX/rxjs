import SubscriptionReference from './subscription-reference';

export default class CompositeSubscriptionReference extends SubscriptionReference {
	add(subscription) {
		if(!this._subscription) {
			this.pendingAdds = this.pendingAdds || [];
			this.pendingAdds.push(subscription);
		} else {
			this._subscription.add(subscription);
		}
	}

	remove(subscription) {
		if(!this._subscription && this.pendingAdds) {
			this.pendingAdds.splice(this.pendingAdds.indexOf(subscription), 1);
		} else {
			this._subscription.remove(subscription);
		}
	}

	setSubscription(subscription) {
		if(this.pendingAdds) {
			var i, len;
			for(i = 0, len = this.pendingAdds.length; i < len; i++) {
				subscription.add(this.pendingAdds[i]);
			}
			this.pendingAdds = null;
		}

		return SubscriptionReference.prototype.setSubscription.call(this, subscription);
	}
}