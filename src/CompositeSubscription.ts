import Subscription from './Subscription';
import arraySlice from './util/arraySlice';

export default class CompositeSubscription extends Subscription {
  length:number=0;
  _subscriptions:Array<Subscription>;
  
  constructor() {
    super(null, null);
  }
  
  static from(subscriptions:Array<Subscription>):CompositeSubscription {
    var comp = new CompositeSubscription();
    if(Array.isArray(subscriptions)) {
      subscriptions.forEach(sub => comp.add(sub));
    }
    return comp;
  }
  
  unsubscribe() {
    if(this.unsubscribed || !this._subscriptions) { return; }

    this.unsubscribed = true;
    
    var subscriptions = arraySlice(this._subscriptions);
    var subscriptionCount = subscriptions && subscriptions.length || 0;
    var subscriptionIndex = -1;

    this._subscriptions = undefined;

    while(++subscriptionIndex < subscriptionCount) {
        subscriptions[subscriptionIndex].unsubscribe();
    }
  }
  
  add(subscription:Subscription):CompositeSubscription {
    var subscriptions = this._subscriptions || (this._subscriptions = []);
    if (subscription && !subscription.unsubscribed) {
      if (this.unsubscribed) {
          subscription.unsubscribe();
      } else {
          subscriptions.push(subscription);
      }
    }
    this.length = subscriptions.length;
    return this;
  }
  
  remove(subscription:Subscription):CompositeSubscription {
    var unsubscribed = this.unsubscribed;
    var subscriptions = this._subscriptions;
    if(subscriptions) {
      var subscriptionIndex = subscriptions.indexOf(subscription);
      if (subscriptionIndex !== -1) {
        subscriptions.splice(subscriptionIndex, 1);
      }
      this.length = subscriptions.length;
    } else {
      this.length = 0;
    }
    return this;
  }
  
  indexOf(subscription:Subscription):number {
    return this._subscriptions.indexOf(subscription);
  }
}
