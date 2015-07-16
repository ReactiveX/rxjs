import { Subscription } from './Subscription';
import { Observer } from './Observer';

export default class SerialSubscription implements Subscription {
  subscription:Subscription;
  
  isUnsubscribed: boolean = false;
  
  constructor(subscription:Subscription) {
    this.subscription = subscription;
  }
  
  add(subscription:Subscription):Subscription {
    if(subscription) {
      if(this.isUnsubscribed) {
        subscription.unsubscribe();
      } else {
        let currentSubscription = this.subscription;
        this.subscription = subscription;
        if(currentSubscription) {
          currentSubscription.unsubscribe();
        }
      }
    }
    return <Subscription>this;
  }
  
  remove(subscription) {
    if(this.subscription === subscription) {
      this.subscription = undefined;
    }
    return this;
  }
  
  unsubscribe() {
    if (!this.isUnsubscribed) {
      this.isUnsubscribed = true;
      let subscription = this.subscription;
      if (subscription) {
        this.subscription = undefined;
        subscription.unsubscribe();
      }
    }  
  }
}