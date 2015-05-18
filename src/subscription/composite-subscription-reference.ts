import SubscriptionReference from './subscription-reference';
import Subscription from './subscription';
import CompositeSubscription from './composite-subscription';

export default class CompositeSubscriptionReference extends SubscriptionReference {
  protected subscription: CompositeSubscription;
  
  protected pendingAdds:Array<Subscription>

  add(subscription:Subscription) {
    if(!this.subscription) {
      this.pendingAdds = this.pendingAdds || [];
      this.pendingAdds.push(subscription);
    } else {
      this.subscription.add(subscription);
    }
  }

  remove(subscription:Subscription) {
    if(!this.subscription && this.pendingAdds) {
      this.pendingAdds.splice(this.pendingAdds.indexOf(subscription), 1);
    } else {
      this.subscription.remove(subscription);
    }
  }

  setSubscription(subscription:CompositeSubscription) {
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