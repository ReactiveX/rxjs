import { Subscription } from './Subscription';
import arraySlice from './util/arraySlice';

export default class CompositeSubscription implements Subscription {
  length:number=0;

  subscriptions: Array<Subscription>;
  
  isUnsubscribed: boolean = false;

  static from(subscriptions:Array<Subscription>):CompositeSubscription {
    var comp = new CompositeSubscription();
    if(Array.isArray(subscriptions)) {
      subscriptions.forEach(sub => comp.add(sub));
    }
    return comp;
  }
  
  unsubscribe() {
    if(this.isUnsubscribed || !this.subscriptions) { return; }

    this.isUnsubscribed = true;
    
    var subscriptions = arraySlice(this.subscriptions);
    var subscriptionCount = subscriptions && subscriptions.length || 0;
    var subscriptionIndex = -1;

    this.subscriptions = undefined;

    while(++subscriptionIndex < subscriptionCount) {
        subscriptions[subscriptionIndex].unsubscribe();
    }
  }
  
  add(subscription:Subscription):CompositeSubscription {
    var subscriptions = this.subscriptions || (this.subscriptions = []);
    if (subscription && !subscription.isUnsubscribed) {
      if (this.isUnsubscribed) {
          subscription.unsubscribe();
      } else {
          subscriptions.push(subscription);
      }
    }
    this.length = subscriptions.length;
    return this;
  }
  
  remove(subscription:Subscription):CompositeSubscription {
    var isUnsubscribed = this.isUnsubscribed;
    var subscriptions = this.subscriptions;
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
    return this.subscriptions.indexOf(subscription);
  }
}
